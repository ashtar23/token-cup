"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  RefreshCcw,
  XCircle,
} from "lucide-react";
import { InsetHeader } from "@/components/layout/InsetHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { useMatch } from "@/features/matches/data-access/queries/use-match";
import { useUserTokens } from "@/features/user/data-access/queries/use-user-tokens";
import {
  useLastMatchEntry,
  useMatchEntry,
} from "@/features/user/data-access/queries/use-last-match-entry";
import {
  getTotalStaked,
  getHeldTokenSymbols,
} from "@/features/user/lib/tokens";
import { getStakeEligibility } from "@/features/user/lib/stake-eligibility";
import { TEAM_FLAG } from "@/lib/constants";

export function VerifyPage() {
  useAuthGuard();
  const { matchId } = useParams<{ matchId: string }>();

  const { data: match, isLoading: matchLoading } = useMatch(matchId);
  const {
    data: userTokens = [],
    isLoading: tokensLoading,
    refetch: refetchTokens,
  } = useUserTokens();
  const { data: lastEntry, isLoading: entryLoading } =
    useLastMatchEntry(matchId);
  const { data: thisMatchEntry, isLoading: thisEntryLoading } =
    useMatchEntry(matchId);

  const isLoading =
    matchLoading || tokensLoading || entryLoading || thisEntryLoading;

  if (isLoading || !match) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="spinner mx-auto" />
      </div>
    );
  }

  const totalStaked = getTotalStaked(userTokens);
  const eligibility = getStakeEligibility({
    currentEntry: thisMatchEntry ?? null,
    previousEntry: lastEntry ?? null,
    totalStaked,
  });
  const alreadyEntered = eligibility.existingStakeSnapshot !== null;
  const eligible = eligibility.eligible;
  const shortfall = Math.max(0, eligibility.requiredStake - totalStaked);
  const stakeProgress =
    eligibility.requiredStake > 0
      ? Math.min(100, (totalStaked / eligibility.requiredStake) * 100)
      : 100;

  const heldTokens = getHeldTokenSymbols(userTokens);
  const matchTokens = [match.home_token, match.away_token].filter(
    Boolean,
  ) as string[];
  const has2xToken = matchTokens.some((t) => heldTokens.includes(t));

  const homeToken = match.home_token;
  const awayToken = match.away_token;

  return (
    <>
      <InsetHeader backHref="/arena" title="Stake verification" />

      <div className="mx-auto max-w-3xl w-full px-4 py-6 space-y-5">
        <Card className="border border-primary/20 bg-card">
          <CardContent className="space-y-4 p-4 text-center">
            <div className="font-semibold text-foreground text-lg">
              {TEAM_FLAG[match.home_team] ?? "🏳️"} {match.home_team}{" "}
              <span className="text-muted-foreground font-normal">vs</span>{" "}
              {TEAM_FLAG[match.away_team] ?? "🏳️"} {match.away_team}
            </div>
            <div className="mx-auto grid max-w-sm grid-cols-2 gap-2">
              <div className="rounded-lg border border-border bg-background px-3 py-2">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Staked
                </p>
                <p className="text-base font-semibold tabular-nums text-foreground">
                  {totalStaked.toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-background px-3 py-2">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Required
                </p>
                <p className="text-base font-semibold tabular-nums text-foreground">
                  {eligibility.requiredStake.toLocaleString()}+
                </p>
              </div>
            </div>
            <div className="mx-auto max-w-sm space-y-2 text-left">
              <div className="h-2 overflow-hidden rounded-full bg-background">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    eligible ? "bg-tc-green" : "bg-tc-orange",
                  )}
                  style={{ width: `${stakeProgress}%` }}
                />
              </div>
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="text-muted-foreground">
                  {eligible
                    ? "Stake requirement met"
                    : `${shortfall.toLocaleString()} ${shortfall === 1 ? "token" : "tokens"} short`}
                </span>
                <span className="font-medium tabular-nums text-foreground">
                  {Math.round(stakeProgress)}%
                </span>
              </div>
            </div>
            {has2xToken && (
              <Badge className="mx-auto border-tc-orange/30 bg-tc-orange/20 text-tc-orange">
                2x token bonus available
              </Badge>
            )}
          </CardContent>
        </Card>

        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Your staked tokens
          </h2>
          <Card className="border border-border bg-card">
            <CardContent className="p-0">
              {userTokens.length === 0 ? (
                <p className="text-sm text-muted-foreground px-4 py-3">
                  No staked tokens found.
                </p>
              ) : (
                <ul className="divide-y divide-border">
                  {userTokens.map((t) => {
                    const isRelevant =
                      t.token_symbol === homeToken ||
                      t.token_symbol === awayToken;
                    return (
                      <li
                        key={t.id}
                        className={cn(
                          "flex items-center justify-between px-4 py-3 text-base",
                          isRelevant && "bg-tc-amber/5",
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-medium text-foreground">
                            {t.token_symbol}
                          </span>
                          {isRelevant && (
                            <Badge className="bg-tc-orange/20 text-tc-orange border-tc-orange/30 text-sm">
                              2× token
                            </Badge>
                          )}
                        </div>
                        <span className="tabular-nums text-foreground font-medium">
                          {t.staked_amount.toLocaleString()}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        {eligible ? (
          <div className="flex items-start gap-3 rounded-xl border border-tc-green/30 bg-tc-green/5 px-4 py-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-tc-green" />
            <p className="text-sm text-foreground">
              {alreadyEntered ? (
                <>
                  <span className="font-medium">Already entered.</span> Your
                  stake still matches the locked snapshot.
                </>
              ) : (
                <>
                  <span className="font-medium">You&apos;re eligible.</span>{" "}
                  {totalStaked.toLocaleString()} tokens staked
                  {eligibility.previousStake !== null &&
                    `, above your previous ${eligibility.previousStake.toLocaleString()} token entry.`}
                </>
              )}
            </p>
          </div>
        ) : (
          <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3">
            <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
            <p className="text-sm text-foreground">
              <span className="font-medium">
                {eligibility.existingStakeSnapshot !== null
                  ? "Stake below snapshot."
                  : "More stake needed."}
              </span>{" "}
              Add {shortfall.toLocaleString()}{" "}
              {shortfall === 1 ? "token" : "tokens"} to reach the{" "}
              {eligibility.requiredStake.toLocaleString()} token{" "}
              {alreadyEntered ? "locked snapshot" : "entry requirement"}.
            </p>
          </div>
        )}

        <div className="flex items-start gap-3 rounded-xl border border-tc-amber/30 bg-tc-amber/5 px-4 py-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-tc-amber" />
          <p className="text-sm text-tc-amber">
            Keep tokens staked until full time. Unstaking before settlement
            voids your predictions.
          </p>
        </div>

        {eligible ? (
          <Button
            asChild
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-12"
          >
            <Link href={`/arena/${matchId}/predict`}>
              Continue to predictions →
            </Link>
          </Button>
        ) : (
          <div className="space-y-3">
            <Button asChild variant="orange" className="w-full h-12">
              <a
                href="https://www.socios.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                Stake more on Socios.com <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
            <Button
              variant="outline"
              className="w-full h-11"
              onClick={() => refetchTokens()}
            >
              <RefreshCcw className="h-4 w-4" />
              I&apos;ve staked more - refresh balance
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
