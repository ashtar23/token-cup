import { Badge } from "@/components/ui/badge";
import type { BadgeProps } from "@/components/ui/badge";
import type { Match, MatchStatus } from "@/lib/types";

const STATUS_BADGE = {
  live: {
    label: "Live",
    variant: "default",
    className: "bg-tc-green/20 text-tc-green border-tc-green/30",
  },
  upcoming: {
    label: "Open for predictions",
    variant: "default",
    className: "bg-tc-amber/20 text-tc-amber border-tc-amber/30",
  },
  settled: {
    label: "Settled",
    variant: "secondary",
    className: "",
  },
} satisfies Record<
  MatchStatus,
  {
    label: string;
    variant: BadgeProps["variant"];
    className: string;
  }
>;

export function StatusBadge({ status }: { status: Match["status"] }) {
  const config = STATUS_BADGE[status];

  return (
    <Badge
      variant={config.variant}
      className={`${config.className} text-sm px-3 py-1`}
    >
      {config.label}
    </Badge>
  );
}
