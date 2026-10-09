import type { QuizDto } from "@adhd/shared";
import Link from "next/link";
import { QuizFlow } from "@/components/quiz/QuizFlow";
import { isSignedIn, serverFetch } from "@/lib/server-api";

export default async function QuizPage() {
  const [quizRes, signedIn] = await Promise.all([serverFetch("/quizzes/adhd/active"), isSignedIn()]);
  if (!quizRes.ok) {
    throw new Error(`Failed to load the quiz (${quizRes.status})`);
  }
  const quiz = (await quizRes.json()) as QuizDto;

  return (
    <QuizFlow
      quiz={quiz}
      headerActions={
        <Link href={signedIn ? "/report" : "/sign-in"} className="leading-[1.5] hover:text-accent">
          {signedIn ? "My report" : "Sign in"}
        </Link>
      }
    />
  );
}
