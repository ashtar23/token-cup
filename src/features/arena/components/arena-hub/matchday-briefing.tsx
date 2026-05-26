import Link from "next/link";
import { CalendarClock, Flame, ShieldCheck, Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { MatchdayBriefingData } from "../../lib/arena-hub";
import type { ReactNode } from "react";

export function MatchdayBriefing({
  briefing,
}: {
  briefing: MatchdayBriefingData;
}) {
  return (
    <Card className="border border-primary/20 bg-primary/5">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Matchday briefing
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Fastest route back into the competition loop.
            </p>
          </div>
          <Trophy className="h-5 w-5 shrink-0 text-primary" />
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          <BriefingTile
            icon={<CalendarClock className="h-4 w-4" />}
            label="Next up"
            value={briefing.nextOpen?.label ?? "No open matches"}
            meta={
              briefing.nextOpen?.meta ?? "Check Results for settled fixtures"
            }
            href={
              briefing.nextOpen ? `/arena/${briefing.nextOpen.id}` : undefined
            }
          />
          <BriefingTile
            icon={<ShieldCheck className="h-4 w-4" />}
            label="Best 2x chance"
            value={briefing.bestBonus?.label ?? "No token match found"}
            meta={
              briefing.bestBonus?.meta ?? "Add team tokens to unlock bonuses"
            }
            href={
              briefing.bestBonus ? `/arena/${briefing.bestBonus.id}` : undefined
            }
          />
          <BriefingTile
            icon={<Flame className="h-4 w-4" />}
            label="Your form"
            value={`${briefing.bestStreak} streak`}
            meta={`${briefing.openCount} open ${
              briefing.openCount === 1 ? "match" : "matches"
            } available`}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function BriefingTile({
  icon,
  label,
  value,
  meta,
  href,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  meta: string;
  href?: string;
}) {
  const content = (
    <div className="h-full rounded-lg border border-border bg-card/70 p-3 transition hover:border-primary/35">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <span className="text-primary">{icon}</span>
        {label}
      </div>
      <p className="mt-2 line-clamp-2 text-sm font-semibold text-foreground">
        {value}
      </p>
      <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{meta}</p>
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}
