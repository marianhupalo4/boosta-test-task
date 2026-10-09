"use client";

import type { QuizDto, SubmitAttemptInput, SubmitAttemptResponse } from "@adhd/shared";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { ApiError, apiFetch } from "@/lib/api";
import { Header } from "../Header";
import { ChoiceQuestion } from "./ChoiceQuestion";
import { IntroQuestion } from "./IntroQuestion";
import { useQuizState } from "./useQuizState";

const ADVANCE_DELAY_MS = 250;

interface Props {
  quiz: QuizDto;
  headerActions?: ReactNode;
}

/** Renders any quiz definition step by step; question layouts come from the data. */
export function QuizFlow({ quiz, headerActions }: Props) {
  const router = useRouter();
  const { state, setState, restored, clear } = useQuizState(quiz.id);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { questions } = quiz;
  const step = Math.min(state.step, questions.length - 1);
  const question = questions[step];
  const isLast = step === questions.length - 1;

  const counted = questions.filter((q) => q.layout !== "intro");
  const position = counted.indexOf(question) + 1;
  const answeredCount = counted.filter((q) => state.answers[q.key]).length;

  async function submit(answers: Record<string, string>) {
    setSubmitting(true);
    setError(null);
    const body: SubmitAttemptInput = {
      quizVersionId: quiz.id,
      answers: questions.map((q) => ({ questionKey: q.key, value: { optionKey: answers[q.key] } })),
    };

    try {
      const res = await apiFetch<SubmitAttemptResponse>("/attempts", {
        method: "POST",
        body: JSON.stringify(body),
      });
      clear();
      router.push(res.requiresAccount ? "/sign-up" : "/report");
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) {
        // A new quiz version was published while the user was answering.
        clear();
        window.location.reload();
        return;
      }
      setError(e instanceof Error ? e.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  function answer(optionKey: string) {
    const answers = { ...state.answers, [question.key]: optionKey };
    setState({ step, answers });

    if (isLast) {
      void submit(answers);
      return;
    }
    const delay = question.layout === "intro" ? 0 : ADVANCE_DELAY_MS;
    setTimeout(() => setState({ step: step + 1, answers }), delay);
  }

  const goTo = (next: number) => setState({ ...state, step: next });

  if (!restored) return null;

  return (
    <div className={`flex flex-1 flex-col ${question.layout === "intro" ? "" : "bg-white"}`}>
      <Header
        actions={headerActions}
        progress={question.layout === "intro" ? undefined : answeredCount / counted.length}
      />
      {question.layout === "intro" ? (
        <main className="flex flex-1 flex-col">
          <IntroQuestion question={question} onAnswer={answer} />
        </main>
      ) : (
        <main className="flex flex-1 flex-col items-center px-[19px] pt-1 md:pt-0">
          <ChoiceQuestion
            key={question.key}
            question={question}
            selected={state.answers[question.key]}
            disabled={submitting}
            onAnswer={answer}
          />

          {error && (
            <p role="alert" className="mt-6 text-center text-sm text-red-600">
              {error}{" "}
              <button className="underline" onClick={() => submit(state.answers)}>
                Try again
              </button>
            </p>
          )}
          {submitting && (
            <p className="mt-6 text-center text-sm text-ink-3" aria-live="polite">
              Analyzing your answers…
            </p>
          )}

          <div className="mt-auto flex w-full max-w-[860px] items-center justify-between py-10">
            <ArrowButton direction="back" disabled={submitting} onClick={() => goTo(step - 1)} />
            <span className="leading-[22px] text-ink-3 md:text-xl md:leading-7">
              {position}/{counted.length}
            </span>
            <ArrowButton
              direction="next"
              disabled={submitting || !state.answers[question.key]}
              onClick={() => (isLast ? submit(state.answers) : goTo(step + 1))}
            />
          </div>
        </main>
      )}
    </div>
  );
}

function ArrowButton({
  direction,
  ...props
}: { direction: "back" | "next" } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      aria-label={direction === "back" ? "Previous question" : "Next question"}
      className="grid size-9 place-items-center rounded-[4px] bg-accent-4 transition-colors hover:bg-line disabled:opacity-40"
      {...props}
    >
      <Image
        src="/icons/arrow-right.svg"
        alt=""
        width={24}
        height={24}
        className={direction === "back" ? "rotate-180" : undefined}
      />
    </button>
  );
}
