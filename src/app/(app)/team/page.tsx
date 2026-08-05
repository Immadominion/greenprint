import type { Metadata } from "next";
import { Crown, GraduationCap } from "lucide-react";
import { TEAM_MEMBERS, COURSE } from "@/lib/team";
import { FadeIn, Stagger, StaggerItem } from "@/components/greenprint/motion";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Team" };

export default function TeamPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <FadeIn>
        <div className="mb-6 rounded-2xl border border-border bg-gradient-to-br from-brand-soft/60 to-card p-6 shadow-soft">
          <div className="flex items-center gap-2 text-brand">
            <GraduationCap className="size-5" />
            <span className="text-sm font-semibold">{COURSE.code}</span>
          </div>
          <h1 className="mt-2 font-display text-2xl font-bold tracking-tight">{COURSE.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {COURSE.group} · {COURSE.department}, {COURSE.institution}
          </p>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
            Greenprint was designed and built by {TEAM_MEMBERS.length} students. Each member owns a distinct part of the
            system — from the analysis engine to the gamification and UI.
          </p>
        </div>
      </FadeIn>

      <Stagger className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {TEAM_MEMBERS.map((m) => (
          <StaggerItem key={m.id}>
            <div
              className={cn(
                "h-full rounded-2xl border bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift",
                m.lead ? "border-brand/40" : "border-border",
              )}
            >
              <div className="flex items-center justify-between">
                <div className="grid size-11 place-items-center rounded-2xl bg-brand-soft font-display text-lg font-bold text-brand">
                  {m.display.split(" ").map((s) => s[0]).join("").slice(0, 2)}
                </div>
                {m.lead && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand px-2 py-0.5 text-[0.65rem] font-bold text-primary-foreground">
                    <Crown className="size-3" /> Lead
                  </span>
                )}
              </div>
              <div className="mt-3 font-semibold">{m.display}</div>
              <div className="text-xs text-muted-foreground">{m.name}</div>
              <div className="mt-3 inline-flex rounded-lg bg-muted px-2.5 py-1 text-xs font-medium">{m.role}</div>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  );
}
