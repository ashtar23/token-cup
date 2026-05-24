"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { InsetHeader } from "@/components/layout/InsetHeader";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { MATCH_WIN_POINTS, TOURNAMENT_WIN_POINTS } from "@/lib/constants";

const TABS = [
  { href: "/leaderboard", label: "World Cup Overall" },
  { href: "/leaderboard/match", label: "This Match" },
] as const;

export function LeaderboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <>
      <InsetHeader title="Leaderboards" />

      <div className="mx-auto max-w-3xl w-full px-4 py-6 space-y-6">
        {/* Prize banner — stays mounted across tab switches */}
        <Card className="overflow-hidden border border-primary/20 bg-card">
          <CardContent className="p-4">
            <div className="mb-3 text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                Token Cup prizes
              </p>
            </div>
            <div className="grid grid-cols-2 divide-x divide-border">
              <div className="text-center pr-4">
                <p className="text-xs text-muted-foreground mb-1">
                  Match winner
                </p>
                <p className="text-xl font-bold text-foreground">
                  {MATCH_WIN_POINTS.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">reward pts</p>
              </div>
              <div className="text-center pl-4">
                <p className="text-xs text-muted-foreground mb-1">
                  Tournament winner
                </p>
                <p className="text-xl font-bold text-foreground">
                  {TOURNAMENT_WIN_POINTS.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">reward pts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Routed tabs — each tab is a real Next.js route, prefetched on hover/visible */}
        <nav
          role="tablist"
          aria-label="Leaderboard view"
          className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground"
        >
          {TABS.map((tab) => {
            const isActive =
              tab.href === "/leaderboard"
                ? pathname === "/leaderboard"
                : pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                role="tab"
                aria-selected={isActive}
                className={cn(
                  "inline-flex flex-1 items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isActive
                    ? "bg-background text-foreground shadow-sm"
                    : "hover:text-foreground",
                )}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>

        {/* Page content (tournament or match) */}
        <div className="space-y-4">{children}</div>

        <p className="text-center text-xs text-muted-foreground">
          Live — updates after full time
        </p>
      </div>
    </>
  );
}
