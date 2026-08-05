import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { Leaf, Trophy, Zap } from "lucide-react";
import { getSession } from "@/lib/session";
import { Logo } from "@/components/greenprint/logo";
import { COURSE } from "@/lib/team";

const HIGHLIGHTS = [
  { icon: Zap, title: "Instant analysis", text: "Complexity, energy and CO₂ estimates in milliseconds - fully offline." },
  { icon: Leaf, title: "Greener alternatives", text: "Every issue comes with a concrete, more efficient fix." },
  { icon: Trophy, title: "Level up", text: "Earn XP, keep streaks, and climb the team leaderboard." },
];

export default async function AuthLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-brand via-brand-bright to-warn p-12 text-white lg:flex">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-20" />
        <div className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-white/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 size-96 rounded-full bg-eco/30 blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-2.5">
            <Leaf className="size-7" />
            <span className="font-display text-2xl font-extrabold tracking-tight">Greenprint</span>
          </div>
        </div>

        <div className="relative max-w-md">
          <h2 className="font-display text-4xl font-bold leading-[1.1]">A green blueprint for your code.</h2>
          <p className="mt-4 text-white/85">
            Write software the planet can afford. Greenprint finds the wasteful patterns, estimates their cost, and
            coaches you toward faster, greener code.
          </p>
          <div className="mt-9 space-y-5">
            {HIGHLIGHTS.map((h) => (
              <div key={h.title} className="flex items-start gap-3.5">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/15 backdrop-blur">
                  <h.icon className="size-5" />
                </span>
                <div>
                  <div className="font-semibold">{h.title}</div>
                  <div className="text-sm text-white/80">{h.text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative text-sm text-white/70">
          {COURSE.code} · {COURSE.title} · {COURSE.group} · {COURSE.institution}
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-background p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
