import type { Question } from "@adhd/shared";

interface Props {
  question: Question;
  selected?: string;
  disabled?: boolean;
  onAnswer: (optionKey: string) => void;
}

export function ChoiceQuestion({ question, selected, disabled, onAnswer }: Props) {
  return (
    <fieldset
      className="flex w-full max-w-[860px] flex-col gap-3 md:gap-8"
      disabled={disabled}
      aria-labelledby={`q-${question.key}`}
    >
      <h1
        id={`q-${question.key}`}
        className="flex min-h-20 items-center justify-center text-center font-display text-xl font-medium leading-[1.2] text-ink md:min-h-[88px] md:text-[32px] md:leading-9"
      >
        <span className="max-w-[600px]">{question.title}</span>
      </h1>
      <div className="flex flex-col gap-3 md:gap-4">
        {question.options.map((option) => {
          const isSelected = option.key === selected;
          return (
            <button
              key={option.key}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onAnswer(option.key)}
              className={`rounded-lg border px-4 py-[18px] text-left font-medium leading-[1.4] text-ink transition-colors md:rounded-xl md:p-6 md:text-xl md:leading-7 ${
                isSelected
                  ? "border-accent bg-accent-3 shadow-selected"
                  : "border-transparent bg-accent-4 hover:border-accent-2"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
