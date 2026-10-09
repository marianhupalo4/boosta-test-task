import type { Outcome, ReportSection } from '@adhd/shared';
import type { ScoringResult } from '../scoring/scoring.types';
import { ReportBuilderService } from './report-builder.service';
import type { ReportContext, ReportTemplate } from './report.types';

function context(
  outcome: Outcome,
  gender: string,
  extra: [string, string][] = [],
): ReportContext {
  const result: ScoringResult = {
    outcome,
    score: outcome === 'high' ? 74 : 52,
    maxScore: 100,
    details: {},
  };
  return {
    answers: new Map(
      [['gender', gender], ...extra].map(([k, v]) => [k, { optionKey: v }]),
    ),
    result,
    loadHistory: () => Promise.resolve([]),
  };
}

const section = <T extends ReportSection['type']>(
  sections: ReportSection[],
  type: T,
) =>
  sections.find((s) => s.type === type) as Extract<ReportSection, { type: T }>;

describe('ReportBuilderService', () => {
  const builder = new ReportBuilderService();

  it.each([
    ['high', 'male', /In men/],
    ['high', 'female', /In women/],
    ['low', 'male', /In men/],
    ['low', 'female', /For women/],
  ] as const)('builds adhd-v1 for %s / %s', async (outcome, gender, text) => {
    const report = await builder.build('adhd-v1', context(outcome, gender));

    expect(report).toMatchObject({ template: 'adhd-v1', templateVersion: 1 });
    expect(report.sections.map((s) => s.type)).toEqual([
      'score-hero',
      'score-explanation',
      'strengths',
      'emotional-regulation',
      'faq',
    ]);
    expect(section(report.sections, 'score-hero').data.label).toBe(
      outcome === 'high' ? 'High ADHD Traits' : 'Low ADHD Traits',
    );
    expect(section(report.sections, 'score-explanation').data.body).toMatch(
      text,
    );
  });

  it('lists emotional challenges only for high traits', async () => {
    const high = await builder.build('adhd-v1', context('high', 'male'));
    const low = await builder.build('adhd-v1', context('low', 'male'));

    expect(
      section(high.sections, 'emotional-regulation').data.items,
    ).toHaveLength(4);
    expect(section(low.sections, 'emotional-regulation').data.items).toEqual(
      [],
    );
  });

  it('includes conditional sections only when their answer is present', async () => {
    const custom = new ReportBuilderService();
    const template: ReportTemplate = {
      key: 'conditional',
      version: 1,
      sections: [
        {
          type: 'score-explanation',
          version: 1,
          isApplicable: (ctx) =>
            ctx.answers.get('misplacing_items')?.optionKey === 'strongly_agree',
          build: () => ({ title: 'Keeping track of things', body: '...' }),
        },
      ],
    };
    custom.register(template);

    const withAnswer = await custom.build(
      'conditional',
      context('high', 'male', [['misplacing_items', 'strongly_agree']]),
    );
    const without = await custom.build('conditional', context('high', 'male'));

    expect(withAnswer.sections).toHaveLength(1);
    expect(without.sections).toHaveLength(0);
  });

  it('rejects unknown templates', async () => {
    await expect(builder.build('nope', context('low', 'male'))).rejects.toThrow(
      /Unknown report template/,
    );
  });
});
