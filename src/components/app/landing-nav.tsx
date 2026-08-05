"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LogoMark } from "@/components/greenprint/logo";
import { ThemeToggle } from "@/components/greenprint/theme-toggle";

/** Eddie-style floating two-island nav: a brand pill on the left, an action pill on the right. */
export function LandingNav() {
  return (
    <header className="relative top-3 z-50 mx-auto flex max-w-[1480px] items-center justify-between px-3 sm:sticky sm:px-5">
      <Link
        href="/"
        className="flex items-center gap-3 rounded-[26px] border border-border/60 bg-card/90 py-2.5 pl-3 pr-5 shadow-[0_10px_30px_rgba(20,18,40,0.10)] backdrop-blur-xl transition-transform hover:-translate-y-0.5"
      >
        <LogoMark size={38} />
        <span className="font-display text-xl font-extrabold tracking-tight">
          Green<span className="text-gradient-eco">print</span>
        </span>
      </Link>

      <div className="flex items-center gap-1.5 rounded-full border border-border/60 bg-card/90 p-2 shadow-[0_10px_30px_rgba(20,18,40,0.10)] backdrop-blur-xl">
        <ThemeToggle className="border-0 bg-transparent shadow-none" />
        <Link
          href="/login"
          className="hidden rounded-full px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
        >
          Book a demo
        </Link>
        <Link
          href="/signup"
          className="group inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition-transform hover:-translate-y-0.5"
        >
          Get started
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </header>
  );
}
