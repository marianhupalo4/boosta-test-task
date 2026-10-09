import Image from "next/image";
import Link from "next/link";

export function Logo({ onDark = false }: { onDark?: boolean }) {
  return (
    <Link href="/" aria-label="BrainsMate home" className="shrink-0">
      <Image
        src={onDark ? "/images/logo-on-dark.svg" : "/images/logo.svg"}
        alt="BrainsMate"
        width={184}
        height={33}
        priority
        className={onDark ? "h-[29px] w-auto md:h-[33px]" : "h-6 w-auto md:h-[33px]"}
      />
    </Link>
  );
}
