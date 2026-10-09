import { Injectable } from '@nestjs/common';
import type { ReportSection } from '@adhd/shared';
import type {
  BuiltReport,
  ReportContext,
  ReportTemplate,
} from './report.types';
import { adhdV1Template } from './templates/adhd-v1';

const TEMPLATES: ReportTemplate[] = [adhdV1Template];

@Injectable()
export class ReportBuilderService {
  private readonly templates = new Map<string, ReportTemplate>(
    TEMPLATES.map((t) => [t.key, t]),
  );

  /** Lets tests and future features plug in extra templates. */
  register(template: ReportTemplate): void {
    this.templates.set(template.key, template);
  }

  async build(templateKey: string, ctx: ReportContext): Promise<BuiltReport> {
    const template = this.templates.get(templateKey);
    if (!template) {
      throw new Error(`Unknown report template "${templateKey}"`);
    }

    const sections: ReportSection[] = [];
    for (const section of template.sections) {
      if (section.isApplicable && !(await section.isApplicable(ctx))) {
        continue;
      }
      sections.push({
        type: section.type,
        version: section.version,
        data: await section.build(ctx),
      } as ReportSection); // each builder's type and data belong to the same variant
    }

    return {
      template: template.key,
      templateVersion: template.version,
      sections,
    };
  }
}
