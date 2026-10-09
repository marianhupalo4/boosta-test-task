"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto max-w-md flex-1 px-4 py-24 text-center">
      <h1 className="font-display text-2xl font-bold">Something went wrong</h1>
      <p className="mt-2 text-ink-3">Please try again in a moment.</p>
      <button onClick={reset} className="mt-6 rounded-lg bg-primary px-6 py-3 font-medium text-white">
        Try again
      </button>
    </main>
  );
}
