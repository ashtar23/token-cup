"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TEAM_FLAG } from "@/lib/constants";
import {
  useSettleNotifications,
  type SettleNotification,
} from "../hooks/use-settle-notifications";

export function NotificationBell() {
  const { notifications, unreadCount, markAllSeen } = useSettleNotifications();

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        if (open && unreadCount > 0) markAllSeen();
      }}
    >
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8"
          aria-label={
            unreadCount > 0
              ? `${unreadCount} new notification${unreadCount === 1 ? "" : "s"}`
              : "Notifications"
          }
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground tabular-nums">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="font-normal text-sm normal-case tracking-normal py-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-foreground">Notifications</span>
            {notifications.length > 0 && (
              <span className="text-xs text-muted-foreground">
                {notifications.length} recent
              </span>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="py-6 px-3 text-center text-sm text-muted-foreground">
            No settled predictions yet. Once one of your matches finishes,
            you&apos;ll see it here.
          </div>
        ) : (
          notifications.map((n) => <NotificationRow key={n.predictionId} n={n} />)
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function NotificationRow({ n }: { n: SettleNotification }) {
  const when = formatRelative(n.settledAt);
  return (
    <DropdownMenuItem asChild>
      <Link
        href={`/arena/${n.matchId}`}
        className="flex items-start gap-3 py-2.5 px-3 cursor-pointer"
      >
        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-base shrink-0">
          {n.voided ? "⚠️" : n.pointsEarned > 0 ? "🎉" : "🏁"}
        </div>
        <div className="flex-1 min-w-0 space-y-0.5">
          <p className="text-base font-medium text-foreground truncate">
            {TEAM_FLAG[n.homeTeam] ?? ""} {n.homeTeam} vs{" "}
            {TEAM_FLAG[n.awayTeam] ?? ""} {n.awayTeam}
          </p>
          <p
            className={cn(
              "text-sm",
              n.voided
                ? "text-destructive"
                : n.pointsEarned > 0
                  ? "text-tc-green"
                  : "text-muted-foreground",
            )}
          >
            {n.voided
              ? "Prediction voided — stake dropped"
              : n.pointsEarned > 0
                ? `+${n.pointsEarned} pts`
                : "No points this match"}{" "}
            · <span className="text-muted-foreground">{when}</span>
          </p>
        </div>
      </Link>
    </DropdownMenuItem>
  );
}

function formatRelative(iso: string): string {
  const now = Date.now();
  const then = +new Date(iso);
  const diff = now - then;
  const min = Math.floor(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.floor(hr / 24);
  return `${d}d ago`;
}
