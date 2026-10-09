import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/AuthForm";
import { Header } from "@/components/Header";

export const metadata: Metadata = { title: "Sign in" };

export default function SignInPage() {
  return (
    <>
      <Header />
      <main className="flex flex-1 flex-col items-center gap-8 px-[19px] py-16 text-center md:py-[120px]">
        <div className="flex flex-col items-center gap-1">
          <h1 className="font-display text-[32px] font-bold leading-[1.2] text-ink">Sign in</h1>
          <p className="leading-[1.5] text-ink-2">Welcome back! Let’s continue your learning journey</p>
        </div>
        <AuthForm mode="sign-in" />
      </main>
    </>
  );
}
