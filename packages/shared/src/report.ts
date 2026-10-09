export type Outcome = 'high' | 'low';

interface SectionBase<TType extends string, TData> {
  type: TType;
  /** Version of the section's data shape, bumped on breaking changes. */
  version: number;
  data: TData;
}

export type ScoreHeroSection = SectionBase<
  'score-hero',
  { title: string; label: string; outcome: Outcome; score: number; maxScore: number }
>;

export type TextSection = SectionBase<'score-explanation', { title: string; body: string }>;

export type StrengthsSection = SectionBase<
  'strengths',
  { title: string; intro?: string; items: string[] }
>;

export type EmotionalRegulationSection = SectionBase<
  'emotional-regulation',
  { title: string; intro: string; items: string[]; outro?: string }
>;

export type FaqSection = SectionBase<
  'faq',
  { title: string; items: { question: string; answer: string }[] }
>;

export type ReportSection =
  | ScoreHeroSection
  | TextSection
  | StrengthsSection
  | EmotionalRegulationSection
  | FaqSection;

export type ReportSectionType = ReportSection['type'];

export interface ReportDto {
  id: string;
  attemptId: string;
  template: string;
  templateVersion: number;
  createdAt: string;
  sections: ReportSection[];
}

export interface MyReportResponse {
  report: ReportDto | null;
}
