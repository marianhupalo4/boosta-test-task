import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/AuthForm";
import { Header } from "@/components/Header";

export const metadata: Metadata = { title: "Create your account" };

export default function SignUpPage() {
  return (
    <>
      <Header />
      <main className="flex flex-1 flex-col items-center gap-8 px-[19px] pt-10 text-center md:pt-20">
        <div className="flex flex-col items-center gap-4">
          <h1 className="font-display text-[32px] font-bold leading-[1.2] text-ink md:text-5xl">
            Discover your <span className="text-accent">ADHD</span> Profile
          </h1>
          <p className="font-medium leading-[1.4] text-ink-3 md:text-xl">
            Enter your email and password to access your full report
          </p>
        </div>
        <AuthForm mode="sign-up" />
      </main>
    </>
  );
}
