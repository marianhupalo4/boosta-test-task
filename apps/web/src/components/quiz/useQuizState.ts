"use client";

import { useEffect, useState } from "react";

interface QuizState {
  step: number;
  answers: Record<string, string>;
}

const EMPTY: QuizState = { step: 0, answers: {} };

/**
 * Quiz progress kept in localStorage so a reload does not lose answers.
 * The key includes the quiz version id: when a new version is published,
 * progress for the old one is simply ignored.
 */
export function useQuizState(quizVersionId: string) {
  const storageKey = `adhd-quiz:${quizVersionId}`;
  const [state, setState] = useState<QuizState>(EMPTY);
  const [restored, setRestored] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time restore after hydration
      if (saved) setState(JSON.parse(saved) as QuizState);
    } catch {
      // storage unavailable or corrupted: start over
    }
    setRestored(true);
  }, [storageKey]);

  useEffect(() => {
    if (!restored) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {
      // storage unavailable: progress just won't survive a reload
    }
  }, [restored, state, storageKey]);

  const clear = () => {
    try {
      localStorage.removeItem(storageKey);
    } catch {}
  };

  return { state, setState, restored, clear };
}
