import type {
  EmotionalRegulationSection,
  FaqSection,
  ScoreHeroSection,
  StrengthsSection,
  TextSection,
} from '@adhd/shared';
import type {
  ReportContext,
  ReportTemplate,
  SectionBuilder,
} from '../../report.types';
import { content, type Gender } from './content';

/** adhd-v1 is only used with quiz versions that ask the `gender` question. */
function genderOf(ctx: ReportContext): Gender {
  const gender = ctx.answers.get('gender')?.optionKey;
  if (gender !== 'male' && gender !== 'female') {
    throw new Error(`adhd-v1 report: unsupported gender "${gender}"`);
  }
  return gender;
}

const forUser = (ctx: ReportContext) =>
  content[ctx.result.outcome].byGender[genderOf(ctx)];

const scoreHero: SectionBuilder<ScoreHeroSection> = {
  type: 'score-hero',
  version: 1,
  build: ({ result }) => ({
    title: 'Your ADHD score',
    label: content[result.outcome].label,
    outcome: result.outcome,
    score: result.score,
    maxScore: result.maxScore,
  }),
};

const scoreExplanation: SectionBuilder<TextSection> = {
  type: 'score-explanation',
  version: 1,
  build: (ctx) => ({
    title: 'Understanding Your Score',
    body: forUser(ctx).explanation,
  }),
};

const strengths: SectionBuilder<StrengthsSection> = {
  type: 'strengths',
  version: 1,
  build: (ctx) => ({
    title: 'Your Cognitive and Behavioral Strengths',
    ...forUser(ctx).strengths,
  }),
};

const emotionalRegulation: SectionBuilder<EmotionalRegulationSection> = {
  type: 'emotional-regulation',
  version: 1,
  build: (ctx) => ({
    title: 'Your Emotional Regulation and Impulse Control',
    ...forUser(ctx).emotional,
  }),
};

const faq: SectionBuilder<FaqSection> = {
  type: 'faq',
  version: 1,
  build: ({ result }) => ({
    title: 'Frequently asked questions',
    items: content[result.outcome].faq,
  }),
};

export const adhdV1Template: ReportTemplate = {
  key: 'adhd-v1',
  version: 1,
  sections: [scoreHero, scoreExplanation, strengths, emotionalRegulation, faq],
};
