import { Calendar, Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Match } from "@/lib/types";
import type { ReactNode } from "react";
import { formatStage } from "./match-detail-utils";

export function MatchInfo({ match }: { match: Match }) {
  const kickoff = new Date(match.kickoff_at);
  const kickoffStr = kickoff.toLocaleString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="grid grid-cols-2 gap-3">
      <InfoCard icon={<Calendar className="h-4 w-4" />} label="Kickoff">
        {kickoffStr}
      </InfoCard>
      <InfoCard icon={<Trophy className="h-4 w-4" />} label="Stage">
        {match.group_name ?? formatStage(match.stage)}
      </InfoCard>
    </div>
  );
}

function InfoCard({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <Card className="border border-border bg-card">
      <CardContent className="space-y-1.5 p-4">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          {icon}
          {label}
        </div>
        <p className="text-lg font-semibold text-foreground">{children}</p>
      </CardContent>
    </Card>
  );
}
