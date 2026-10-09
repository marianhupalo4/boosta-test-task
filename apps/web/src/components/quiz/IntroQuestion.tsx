import type { Question } from "@adhd/shared";
import Image from "next/image";
import { Button } from "../Button";

interface Props {
  question: Question;
  onAnswer: (optionKey: string) => void;
}

export function IntroQuestion({ question, onAnswer }: Props) {
  const [firstLine, secondLine] = splitTitle(question.title);

  return (
    <div className="flex w-full justify-center px-[19px] pb-10 md:pt-10">
      <div className="flex w-full max-w-[352px] flex-col items-center gap-10 rounded-2xl border border-surface bg-white px-4 py-8 shadow-modal md:max-w-none md:w-auto md:gap-8 md:rounded-[20px] md:p-10">
        <div className="flex w-full flex-col items-center gap-6 md:gap-8">
          <TraitsIllustration />

          <div className="flex flex-col items-center gap-5 text-center">
            <h1 className="max-w-[270px] font-display text-2xl font-semibold leading-[1.2] text-ink md:max-w-none md:text-5xl md:leading-[58px]">
              {firstLine}
              <br />
              <span className="text-accent">{secondLine}</span>
            </h1>
            {question.subtitle && (
              <p className="leading-[1.4] text-ink-2 md:w-[512px] md:text-xl md:leading-7">{question.subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex w-full gap-4 md:w-auto md:gap-3">
          {question.options.map((option) => (
            <Button
              key={option.key}
              type="button"
              onClick={() => onAnswer(option.key)}
              className="flex-1 rounded-md px-4 py-[15px] leading-[22px] md:w-60 md:flex-none md:rounded-lg md:px-8 md:py-3.5 md:text-xl md:leading-7"
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

const CHIP = "absolute rounded-[10px] border border-surface bg-surface/50 py-2 text-xl font-medium leading-7 backdrop-blur-[0.75px]";

/** Decorative header from the design; drawn at desktop size and scaled down on mobile. */
function TraitsIllustration() {
  return (
    <div aria-hidden className="h-[163px] w-[320px] md:h-[284px] md:w-[558px]">
      <div className="relative h-[284px] w-[558px] origin-top-left scale-[0.5735] md:scale-100">
        <Image
          src="/images/head-profile.png"
          alt=""
          width={273}
          height={237}
          priority
          className="absolute left-1/2 top-1/2 h-[237px] w-[273px] -translate-x-1/2 -translate-y-1/2 object-cover"
        />
        <div className={`${CHIP} left-[343px] top-[6px] flex items-center gap-2 px-3`}>
          <span className="flex items-center gap-0.5 text-accent">
            <Image src="/icons/trend-up.svg" alt="" width={24} height={24} />
            +10%
          </span>
          <span className="text-slate">Impulsivity</span>
        </div>
        <div className={`${CHIP} left-[24px] top-[164px] flex items-center gap-2 px-3`}>
          <span className="flex items-center gap-0.5 text-accent">
            <Image src="/icons/trend-down.svg" alt="" width={24} height={24} />
            -6%
          </span>
          <span className="text-slate">Focuse</span>
        </div>
        <div className={`${CHIP} left-0 top-[40px] flex flex-col items-start px-6`}>
          <span className="text-accent">High</span>
          <span className="text-slate">Productivity</span>
        </div>
        <div className={`${CHIP} left-[394px] top-[186px] flex flex-col items-end px-6`}>
          <span className="text-accent">Medium</span>
          <span className="text-slate">Distractions</span>
        </div>
      </div>
    </div>
  );
}

/** "Discover Your ADHD Trait Profile" -> ["Discover Your", "ADHD Trait Profile"] */
function splitTitle(title: string): [string, string] {
  const words = title.split(" ");
  const cut = Math.min(2, words.length - 1);
  return [words.slice(0, cut).join(" "), words.slice(cut).join(" ")];
}
