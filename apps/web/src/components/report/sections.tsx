import type {
  EmotionalRegulationSection,
  FaqSection,
  ReportSection,
  ScoreHeroSection,
  StrengthsSection,
  TextSection,
} from "@adhd/shared";
import Image from "next/image";
import type { ComponentType, ReactNode } from "react";
import { ScoreGauge } from "./ScoreGauge";

function ScoreHero({ data }: ScoreHeroSection) {
  return (
    <section className="bg-surface py-6">
      <div className="mx-auto flex max-w-[1440px] flex-col items-center gap-8 md:flex-row md:justify-between md:gap-6 md:px-[180px]">
        <div className="flex flex-col items-center gap-1.5 text-center md:items-start md:gap-2 md:text-left">
          <h1 className="font-display text-2xl font-semibold leading-[1.2] text-ink md:text-5xl md:leading-[58px] md:text-ink-2">
            {data.title}
          </h1>
          <p className="font-display text-lg font-medium leading-[1.2] text-ink-2 md:text-[32px] md:text-ink-3">
            {data.label}
          </p>
        </div>
        <ScoreGauge score={data.score} maxScore={data.maxScore} />
      </div>
    </section>
  );
}

const Section = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <section
    className={`mx-auto flex w-full max-w-[1440px] flex-col gap-5 px-[19px] py-6 md:gap-9 md:px-[180px] md:py-10 ${className}`}
  >
    {children}
  </section>
);

const Title = ({ children }: { children: ReactNode }) => (
  <h2 className="font-display text-xl font-semibold leading-[1.2] text-ink-2 md:text-[32px] md:font-medium md:leading-9">
    {children}
  </h2>
);

const Subtitle = ({ children }: { children: ReactNode }) => (
  <p className="font-display font-light leading-[1.2] text-ink-3 md:text-xl">{children}</p>
);

const Body = ({ children }: { children: ReactNode }) => (
  <p className="leading-[22px] text-ink-3 md:text-xl md:leading-7">{children}</p>
);

function ScoreExplanation({ data }: TextSection) {
  return (
    <Section>
      <div className="flex gap-3 md:gap-5">
        <span aria-hidden className="w-1 shrink-0 rounded-full bg-accent-line" />
        <div className="flex flex-col gap-5">
          <Title>{data.title}</Title>
          <p className="text-sm leading-5 text-ink-3 md:text-xl md:leading-7">{data.body}</p>
        </div>
      </div>
    </Section>
  );
}

function Strengths({ data }: StrengthsSection) {
  return (
    <Section>
      <div className="flex flex-col gap-1">
        <Title>{data.title}</Title>
        {data.intro && <Subtitle>{data.intro}</Subtitle>}
      </div>
      <ul className="flex flex-col gap-3 md:gap-4">
        {data.items.map((item) => (
          <li key={item} className="flex items-center gap-3 text-sm font-medium leading-5 text-ink-3 md:text-xl md:leading-7">
            <span aria-hidden className="grid size-7 shrink-0 place-items-center rounded-full bg-primary-soft">
              <Image src="/icons/check.svg" alt="" width={16} height={16} />
            </span>
            {item}
          </li>
        ))}
      </ul>
    </Section>
  );
}

/** With listed challenges (high traits) the intro is a subtitle; otherwise it is the section body. */
function EmotionalRegulation({ data }: EmotionalRegulationSection) {
  if (data.items.length === 0) {
    return (
      <Section>
        <Title>{data.title}</Title>
        <Body>{data.intro}</Body>
      </Section>
    );
  }

  return (
    <Section>
      <div className="flex flex-col gap-2 md:gap-1">
        <Title>{data.title}</Title>
        <Subtitle>{data.intro}</Subtitle>
      </div>
      <ul className="flex flex-col gap-2 md:gap-4">
        {data.items.map((item) => (
          <li key={item} className="flex items-center gap-2 text-sm leading-5 text-ink-3 md:gap-3 md:text-xl md:leading-7">
            <span aria-hidden className="size-2 shrink-0 rounded-full bg-accent-2" />
            {item}
          </li>
        ))}
      </ul>
      {data.outro && (
        <p className="font-medium leading-[22px] text-ink-3 md:text-xl md:leading-7 md:text-ink-2">{data.outro}</p>
      )}
    </Section>
  );
}

function Faq({ data }: FaqSection) {
  return (
    <section className="mx-auto flex w-full max-w-[1440px] flex-col items-center gap-5 px-[19px] py-6 md:gap-12 md:px-[70px] md:py-[60px]">
      <h2 className="max-w-[267px] text-center font-display text-2xl font-semibold leading-[1.2] text-ink md:max-w-none md:text-[32px] md:font-medium md:leading-9">
        {data.title}
      </h2>
      <div className="flex w-full max-w-[1080px] flex-col gap-3 md:gap-4">
        {data.items.map((item, i) => (
          <details key={item.question} open={i === 0} className="group flex flex-col">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 border-b border-line p-2 md:p-3 [&::-webkit-details-marker]:hidden">
              <span className="font-display text-lg font-medium leading-[1.2] text-ink-2 md:text-2xl md:leading-[26px]">
                {item.question}
              </span>
              <span
                aria-hidden
                className="grid size-6 shrink-0 place-items-center rounded-full border border-accent-3 md:size-9 md:border-accent-2"
              >
                <Image
                  src="/icons/chevron-up.svg"
                  alt=""
                  width={12}
                  height={12}
                  className="size-2.5 rotate-180 transition-transform group-open:rotate-0 md:size-3"
                />
              </span>
            </summary>
            <p className="px-2 pb-4 pt-3 leading-[22px] text-ink-2 md:max-w-[964px] md:px-3 md:text-xl md:leading-7">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}

/**
 * Section type -> component. Sections the client does not know yet are
 * skipped, so the API can ship new section types before the UI renders them.
 */
const SECTION_COMPONENTS: {
  [T in ReportSection["type"]]: ComponentType<Extract<ReportSection, { type: T }>>;
} = {
  "score-hero": ScoreHero,
  "score-explanation": ScoreExplanation,
  strengths: Strengths,
  "emotional-regulation": EmotionalRegulation,
  faq: Faq,
};

export function ReportSections({ sections }: { sections: ReportSection[] }) {
  return sections.map((section, i) => {
    const Component = SECTION_COMPONENTS[section.type] as ComponentType<ReportSection> | undefined;
    return Component ? <Component key={`${section.type}-${i}`} {...section} /> : null;
  });
}
