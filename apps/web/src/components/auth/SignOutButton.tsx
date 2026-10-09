"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

export function SignOutButton() {
  const router = useRouter();

  async function signOut() {
    await apiFetch("/auth/sign-out", { method: "POST" });
    router.replace("/sign-in");
    router.refresh();
  }

  return (
    <button type="button" onClick={signOut} className="flex items-center gap-1 leading-[1.5] hover:text-accent">
      <Image src="/icons/sign-out.svg" alt="" width={16} height={16} className="md:size-5" />
      Sign out
    </button>
  );
}
