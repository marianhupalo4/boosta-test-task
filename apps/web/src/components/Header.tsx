import type { ReactNode } from "react";
import { Logo } from "./Logo";

interface HeaderProps {
  actions?: ReactNode;
  /** 0..1, renders the quiz progress bar under the header when set. */
  progress?: number;
}

export function Header({ actions, progress }: HeaderProps) {
  return (
    <header className="flex w-full flex-col gap-2 px-[19px] py-2 md:gap-4 md:px-[70px] md:py-5">
      <div className="flex items-center justify-between py-2">
        <Logo />
        <nav className="flex items-center gap-5 font-medium text-ink-2">{actions}</nav>
      </div>
      {progress !== undefined && (
        <div
          className="h-1 w-full rounded-[4px] bg-accent-4"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
        >
          <div
            className="h-full rounded-[31px] bg-accent transition-[width] duration-300"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      )}
    </header>
  );
}
