import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { Answer, QuizDto } from '@adhd/shared';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { Prisma } from '../src/generated/prisma/client';
import { PrismaService } from '../src/prisma/prisma.service';
import { ReportBuilderService } from '../src/reports/report-builder.service';
import { adhdV1Template } from '../src/reports/templates/adhd-v1';

describe('ADHD funnel (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let quiz: QuizDto;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.use(cookieParser());
    await app.init();

    prisma = app.get(PrismaService);
    quiz = (await request(app.getHttpServer()).get('/api/quizzes/adhd/active'))
      .body as QuizDto;
  });

  beforeEach(async () => {
    await prisma.attempt.deleteMany();
    await prisma.user.deleteMany();
    await prisma.quizVersion.deleteMany({
      where: { status: { not: 'active' } },
    });
  });

  afterAll(async () => {
    await app.close();
  });

  /** Gender plus the same Likert answer for every scored question. */
  function answers(gender: 'male' | 'female', likert: string): Answer[] {
    return quiz.questions.map((q) => ({
      questionKey: q.key,
      value: { optionKey: q.key === 'gender' ? gender : likert },
    }));
  }

  const submit = (agent: ReturnType<typeof request.agent>, a: Answer[]) =>
    agent.post('/api/attempts').send({ quizVersionId: quiz.id, answers: a });

  const credentials = { email: 'user@example.com', password: 'password123' };

  it('serves the active quiz without scoring weights', () => {
    expect(quiz.questions[0].key).toBe('gender');
    expect(JSON.stringify(quiz)).not.toMatch(/weight/i);
  });

  it('lets an anonymous user take the quiz, sign up and see their report', async () => {
    const agent = request.agent(app.getHttpServer());

    const res = await submit(agent, answers('female', 'strongly_agree')).expect(
      201,
    );
    expect(res.body).toMatchObject({ requiresAccount: true });

    await agent.get('/api/reports/me').expect(401);
    await agent.post('/api/auth/sign-up').send(credentials).expect(201);

    const { body } = await agent.get('/api/reports/me').expect(200);
    expect(body.report.attemptId).toBe(res.body.attemptId);
    expect(body.report.sections[0].data).toMatchObject({
      label: 'High ADHD Traits',
      score: 100,
    });
    expect(body.report.sections[1].data.body).toMatch(/In women/);
  });

  it('updates the current report when a signed-in user retakes the quiz', async () => {
    const agent = request.agent(app.getHttpServer());
    await submit(agent, answers('male', 'strongly_agree'));
    await agent.post('/api/auth/sign-up').send(credentials).expect(201);

    const retake = await submit(agent, answers('male', 'disagree')).expect(201);
    expect(retake.body).toMatchObject({ requiresAccount: false });

    const { body } = await agent.get('/api/reports/me').expect(200);
    expect(body.report.attemptId).toBe(retake.body.attemptId);
    expect(body.report.sections[0].data.label).toBe('Low ADHD Traits');
    expect(await prisma.attempt.count()).toBe(2);
  });

  it('links a new anonymous attempt to an existing account on sign in', async () => {
    await request
      .agent(app.getHttpServer())
      .post('/api/auth/sign-up')
      .send(credentials)
      .expect(201);

    const agent = request.agent(app.getHttpServer());
    const res = await submit(agent, answers('male', 'neutral')).expect(201);
    await agent.post('/api/auth/sign-in').send(credentials).expect(200);

    const { body } = await agent.get('/api/reports/me').expect(200);
    expect(body.report.attemptId).toBe(res.body.attemptId);
  });

  it("returns no report for a user without attempts and never leaks other users' reports", async () => {
    const owner = request.agent(app.getHttpServer());
    await submit(owner, answers('male', 'agree'));
    await owner.post('/api/auth/sign-up').send(credentials).expect(201);

    const other = request.agent(app.getHttpServer());
    await other
      .post('/api/auth/sign-up')
      .send({ email: 'other@example.com', password: 'password123' })
      .expect(201);

    const { body } = await other.get('/api/reports/me').expect(200);
    expect(body).toEqual({ report: null });
  });

  it('rejects wrong credentials and duplicate emails', async () => {
    const agent = request.agent(app.getHttpServer());
    await agent.post('/api/auth/sign-up').send(credentials).expect(201);
    await agent.post('/api/auth/sign-up').send(credentials).expect(409);
    await agent
      .post('/api/auth/sign-in')
      .send({ ...credentials, password: 'wrong-password' })
      .expect(401);
    await agent
      .post('/api/auth/sign-in')
      .send({ ...credentials, email: 'USER@example.com ' })
      .expect(200);
  });

  it('rejects incomplete answers', async () => {
    const agent = request.agent(app.getHttpServer());
    const res = await submit(agent, answers('male', 'agree').slice(1)).expect(
      400,
    );
    expect(res.body.errors).toContain('missing answer for "gender"');
  });

  it('keeps old attempts readable but rejects new submissions to archived versions', async () => {
    const archived = await prisma.quizVersion.create({
      data: {
        quizKey: 'adhd',
        version: 0,
        status: 'archived',
        definition: { questions: quiz.questions },
        scoring: {},
        reportTemplate: 'adhd-v1',
      },
    });

    const res = await request(app.getHttpServer())
      .post('/api/attempts')
      .send({ quizVersionId: archived.id, answers: answers('male', 'agree') })
      .expect(409);
    expect(res.body.code).toBe('QUIZ_VERSION_OUTDATED');
  });
  it('keeps old reports intact when a new quiz version is published and lets new sections read previous attempts', async () => {
    const agent = request.agent(app.getHttpServer());
    await submit(agent, answers('female', 'strongly_agree')).expect(201);
    await agent.post('/api/auth/sign-up').send(credentials).expect(201);
    const reportBefore = (await agent.get('/api/reports/me').expect(200)).body;

    // A new report template with a section that compares with the previous attempt.
    app.get(ReportBuilderService).register({
      key: 'adhd-with-history-test',
      version: 1,
      sections: [
        ...adhdV1Template.sections,
        {
          type: 'score-explanation',
          version: 1,
          isApplicable: async (ctx) => (await ctx.loadHistory()).length > 0,
          build: async (ctx) => {
            const [previous] = await ctx.loadHistory();
            const focus = previous.answers.get(
              'focus_conversations',
            )?.optionKey;
            return {
              title: 'Compared to your last attempt',
              body: `previous score ${previous.result.score}, focus answer ${focus}`,
            };
          },
        },
      ],
    });

    // v2 rewords one question and adds a new one; unchanged questions keep their keys.
    const v1 = await prisma.quizVersion.findUniqueOrThrow({
      where: { id: quiz.id },
    });
    const v2Questions = [
      ...quiz.questions.map((q) =>
        q.key === 'time_blindness' ? { ...q, title: 'Reworded question' } : q,
      ),
      { ...quiz.questions[1], key: 'new_question', title: 'A new question' },
    ];
    await prisma.quizVersion.update({
      where: { id: v1.id },
      data: { status: 'archived' },
    });
    const v2 = await prisma.quizVersion.create({
      data: {
        quizKey: 'adhd',
        version: 99,
        status: 'active',
        definition: { questions: v2Questions },
        scoring: v1.scoring as Prisma.InputJsonValue,
        reportTemplate: 'adhd-with-history-test',
      },
    });

    try {
      // The report of the v1 attempt is untouched.
      expect((await agent.get('/api/reports/me').expect(200)).body).toEqual(
        reportBefore,
      );

      const active = (await agent.get('/api/quizzes/adhd/active').expect(200))
        .body as QuizDto;
      expect(active.id).toBe(v2.id);
      await submit(agent, answers('female', 'agree')).expect(409);

      await agent
        .post('/api/attempts')
        .send({
          quizVersionId: v2.id,
          answers: active.questions.map((q) => ({
            questionKey: q.key,
            value: { optionKey: q.key === 'gender' ? 'female' : 'disagree' },
          })),
        })
        .expect(201);

      const { body } = await agent.get('/api/reports/me').expect(200);
      expect(body.report.template).toBe('adhd-with-history-test');
      expect(body.report.sections[0].data.label).toBe('Low ADHD Traits');
      expect(body.report.sections.at(-1).data.body).toBe(
        'previous score 100, focus answer strongly_agree',
      );
    } finally {
      await prisma.attempt.deleteMany();
      await prisma.quizVersion.delete({ where: { id: v2.id } });
      await prisma.quizVersion.update({
        where: { id: v1.id },
        data: { status: 'active' },
      });
    }
  });
});
