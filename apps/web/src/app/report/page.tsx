import type { MyReportResponse } from "@adhd/shared";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ReportSections } from "@/components/report/sections";
import { serverFetch } from "@/lib/server-api";

export const metadata: Metadata = { title: "Your ADHD report" };

export default async function ReportPage() {
  const res = await serverFetch("/reports/me");
  if (res.status === 401) redirect("/sign-in");
  if (!res.ok) throw new Error(`Failed to load the report (${res.status})`);
  const { report } = (await res.json()) as MyReportResponse;

  return (
    <div className="flex flex-1 flex-col bg-white">
      <Header
        actions={
          <>
            <Link href="/" className="leading-[1.5] hover:text-accent">
              {report ? "Retake test" : "Take the test"}
            </Link>
            <SignOutButton />
          </>
        }
      />
      <main className="flex-1">
        {report ? (
          <ReportSections sections={report.sections} />
        ) : (
          <div className="mx-auto max-w-md px-4 py-24 text-center">
            <h1 className="font-display text-[32px] font-bold leading-[1.2] text-ink">No report yet</h1>
            <p className="mt-3 text-ink-3">Take the test to get your personal ADHD trait report.</p>
            <Link
              href="/"
              className="mt-6 inline-block rounded-lg bg-primary px-8 py-3.5 font-medium text-white hover:bg-primary-hover"
            >
              Take the test
            </Link>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
