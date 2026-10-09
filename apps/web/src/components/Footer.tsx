import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="pt-8 md:pt-[60px]">
      <div className="flex flex-col gap-10 rounded-t-2xl bg-footer px-[19px] pb-4 pt-6 md:gap-6 md:rounded-t-3xl md:px-[70px] md:py-10">
        <Logo onDark />
        <p className="text-xs leading-4 text-white md:text-base md:leading-[22px]">
          All rights reserved {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
