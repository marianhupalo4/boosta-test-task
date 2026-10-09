"use client";

import { SignInSchema, SignUpSchema, type UserDto } from "@adhd/shared";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { ApiError, apiFetch } from "@/lib/api";
import { Button } from "../Button";

/** The two forms differ in the design: sign up has white bordered fields, sign in filled ones. */
const MODES = {
  "sign-up": {
    schema: SignUpSchema,
    endpoint: "/auth/sign-up",
    emailPlaceholder: "Enter your email",
    passwordPlaceholder: "Create Password",
    passwordAutocomplete: "new-password",
    submit: "Get My Results",
    width: "md:w-[440px]",
    field: "h-14 border-accent-2 bg-white p-4",
    button: "md:leading-4",
    gap: "gap-4",
  },
  "sign-in": {
    schema: SignInSchema,
    endpoint: "/auth/sign-in",
    emailPlaceholder: "Email",
    passwordPlaceholder: "Password",
    passwordAutocomplete: "current-password",
    submit: "Sign in",
    width: "md:w-[400px]",
    field: "h-[58px] border-line bg-line px-3",
    button: "md:text-xl md:leading-7",
    gap: "gap-5",
  },
} as const;

type FieldErrors = Partial<Record<"email" | "password", string>>;

export function AuthForm({ mode }: { mode: keyof typeof MODES }) {
  const config = MODES[mode];
  const router = useRouter();
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [emailTaken, setEmailTaken] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setEmailTaken(false);

    const parsed = config.schema.safeParse(Object.fromEntries(new FormData(event.currentTarget)));
    if (!parsed.success) {
      const errors = z.flattenError(parsed.error).fieldErrors;
      setFieldErrors({ email: errors.email?.[0], password: errors.password?.[0] });
      return;
    }
    setFieldErrors({});

    setPending(true);
    try {
      await apiFetch<UserDto>(config.endpoint, { method: "POST", body: JSON.stringify(parsed.data) });
      router.replace("/report");
      router.refresh();
    } catch (e) {
      setEmailTaken(e instanceof ApiError && e.status === 409);
      setFormError(
        e instanceof ApiError && e.status === 429
          ? "Too many attempts. Please wait a minute and try again."
          : e instanceof Error
            ? e.message
            : "Something went wrong",
      );
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className={`flex w-full flex-col ${config.gap} ${config.width}`}>
      <div className="flex flex-col gap-2">
        <Field
          name="email"
          type="email"
          placeholder={config.emailPlaceholder}
          autoComplete="email"
          error={fieldErrors.email}
          className={config.field}
        />
        <Field
          name="password"
          type="password"
          placeholder={config.passwordPlaceholder}
          autoComplete={config.passwordAutocomplete}
          error={fieldErrors.password}
          className={config.field}
        />
      </div>

      {formError && (
        <p role="alert" className="text-sm text-red-600">
          {formError}
          {emailTaken && (
            <>
              {" "}
              <Link href="/sign-in" className="font-medium underline">
                Sign in instead
              </Link>
            </>
          )}
        </p>
      )}

      <Button type="submit" disabled={pending} className={`w-full leading-[22px] ${config.button}`}>
        {pending ? "Please wait…" : config.submit}
      </Button>

      <p className="text-center text-sm text-ink-3">
        {mode === "sign-up" ? (
          <>
            Already have an account?{" "}
            <Link href="/sign-in" className="font-medium text-accent">
              Sign in
            </Link>
          </>
        ) : (
          <>
            New here?{" "}
            <Link href="/" className="font-medium text-accent">
              Take the test
            </Link>
          </>
        )}
      </p>
    </form>
  );
}

function Field({
  error,
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
  return (
    <label className="flex flex-col gap-1 text-left">
      <span className="sr-only">{props.placeholder}</span>
      <input
        {...props}
        aria-invalid={Boolean(error)}
        className={`w-full rounded-lg border leading-[22px] text-ink outline-none transition-colors placeholder:text-ink-3 focus:border-accent ${className} ${
          error ? "!border-red-500" : ""
        }`}
      />
      {error && <span className="text-xs text-red-600">{error}</span>}
    </label>
  );
}
