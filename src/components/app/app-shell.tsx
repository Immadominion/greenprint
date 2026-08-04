"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import {
  BookOpen,
  Code2,
  Flame,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Trophy,
  Users,
} from "lucide-react";
import { Logo } from "@/components/greenprint/logo";
import { LevelRing, XpBar } from "@/components/greenprint/xp-bar";
import { ThemeToggle } from "@/components/greenprint/theme-toggle";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

export interface ShellStats {
  level: number;
  rankName: string;
  rankEmoji: string;
  pct: number;
  xp: number;
  xpToNext: number;
  streak: number;
  rankPosition: number;
  totalPlayers: number;
}
export interface ShellUser {
  name: string;
  email: string;
}

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/workspace", label: "Analyze", icon: Code2 },
  { href: "/history", label: "History", icon: History },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/team", label: "Team", icon: Users },
  { href: "/rules", label: "How it works", icon: BookOpen },
];

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");
}

function SidebarBody({
  user,
  stats,
  pathname,
  onNavigate,
}: {
  user: ShellUser;
  stats: ShellStats;
  pathname: string;
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function signOut() {
    setSigningOut(true);
    await authClient.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center px-5">
        <Link href="/dashboard" onClick={onNavigate}>
          <Logo size={32} />
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV.map((item) => {
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-brand-soft text-brand"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              {active && <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-brand" />}
              <item.icon className={cn("size-[18px] transition-transform group-hover:scale-110", active && "text-brand")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Player card */}
      <div className="m-3 rounded-2xl border border-border bg-card p-4 shadow-soft">
        <div className="flex items-center gap-3">
          <LevelRing level={stats.level} pct={stats.pct} size={48} stroke={4} />
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">{user.name}</div>
            <div className="truncate text-xs text-muted-foreground">
              {stats.rankEmoji} {stats.rankName}
            </div>
          </div>
        </div>
        <div className="mt-3">
          <XpBar pct={stats.pct} height={7} />
          <div className="mt-1.5 flex justify-between text-[0.7rem] text-muted-foreground">
            <span>{stats.xp.toLocaleString()} XP</span>
            <span>{stats.xpToNext} to next</span>
          </div>
        </div>
        <button
          onClick={signOut}
          disabled={signingOut}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-border py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
        >
          <LogOut className="size-3.5" />
          {signingOut ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </div>
  );
}

export function AppShell({ user, stats, children }: { user: ShellUser; stats: ShellStats; children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-sidebar lg:flex">
        <SidebarBody user={user} stats={stats} pathname={pathname} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border bg-background/70 px-4 backdrop-blur-xl lg:px-8">
          <div className="flex items-center gap-3">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="lg:hidden">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <SidebarBody user={user} stats={stats} pathname={pathname} onNavigate={() => setOpen(false)} />
              </SheetContent>
            </Sheet>
            <Button asChild className="hidden font-semibold shadow-soft sm:inline-flex">
              <Link href="/workspace">
                <Plus className="size-4" />
                New analysis
              </Link>
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-sm font-semibold shadow-soft">
              <Flame className={cn("size-4", stats.streak > 0 ? "text-brand" : "text-muted-foreground")} />
              <span className="tabular-nums">{stats.streak}</span>
              <span className="hidden text-xs font-normal text-muted-foreground sm:inline">day streak</span>
            </div>
            <div className="hidden items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-sm shadow-soft sm:flex">
              <Trophy className="size-4 text-eco-strong" />
              <span className="font-semibold tabular-nums">#{stats.rankPosition}</span>
              <span className="text-xs text-muted-foreground">/ {stats.totalPlayers}</span>
            </div>
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
