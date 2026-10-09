import type { ReportSection } from '@adhd/shared';
import type { AnswerMap, ScoringResult } from '../scoring/scoring.types';

/** A previous completed attempt of the same user. */
export interface PastAttempt {
  attemptId: string;
  quizVersion: number;
  completedAt: Date;
  answers: AnswerMap;
  result: Pick<ScoringResult, 'outcome' | 'score' | 'maxScore'>;
}

export interface ReportContext {
  answers: AnswerMap;
  result: ScoringResult;
  /**
   * Earlier attempts of the user, newest first. Loaded lazily, so sections
   * that do not compare attempts cost nothing. Empty for anonymous attempts.
   */
  loadHistory(): Promise<PastAttempt[]>;
}

export interface SectionBuilder<S extends ReportSection = ReportSection> {
  type: S['type'];
  version: number;
  /** Omit to always include the section. */
  isApplicable?(ctx: ReportContext): boolean | Promise<boolean>;
  build(ctx: ReportContext): S['data'] | Promise<S['data']>;
}

export interface ReportTemplate {
  /** Referenced from QuizVersion.reportTemplate. */
  key: string;
  /** Bumped whenever the template output changes; stored on every report. */
  version: number;
  sections: SectionBuilder[];
}

export interface BuiltReport {
  template: string;
  templateVersion: number;
  sections: ReportSection[];
}
