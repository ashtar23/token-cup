"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
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
import { getTotalStaked, getHeldTokenSymbols } from "@/features/user/lib/tokens";
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
  const { isLoading: entryLoading } = useLastMatchEntry();
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
  const alreadyEntered = !!thisMatchEntry;
  const eligible = alreadyEntered || totalStaked > 0;

  const heldTokens = getHeldTokenSymbols(userTokens);
  const matchTokens = [match.home_token, match.away_token].filter(
    Boolean,
  ) as string[];
  void matchTokens.some((t) => heldTokens.includes(t)); // (computed for parity; not displayed here)

  const homeToken = match.home_token;
  const awayToken = match.away_token;

  return (
    <>
      <InsetHeader backHref="/arena" title="Stake verification" />

      <div className="mx-auto max-w-3xl w-full px-4 py-6 space-y-5">
        <Card className="border border-border bg-card">
          <CardContent className="p-4">
            <div className="text-center font-semibold text-foreground text-lg">
              {TEAM_FLAG[match.home_team] ?? "🏳️"} {match.home_team}{" "}
              <span className="text-muted-foreground font-normal">vs</span>{" "}
              {TEAM_FLAG[match.away_team] ?? "🏳️"} {match.away_team}
            </div>
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
            <span className="text-lg shrink-0" aria-hidden="true">✅</span>
            <p className="text-sm text-foreground">
              {alreadyEntered ? (
                <>
                  <span className="font-medium">Already entered.</span> Your
                  predictions are locked in.
                </>
              ) : (
                <>
                  <span className="font-medium">You&apos;re eligible.</span>{" "}
                  {totalStaked.toLocaleString()} tokens staked.
                </>
              )}
            </p>
          </div>
        ) : (
          <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3">
            <span className="text-lg shrink-0" aria-hidden="true">❌</span>
            <p className="text-sm text-foreground">
              <span className="font-medium">No stake found.</span> You need at
              least some tokens staked to enter. Head to Socios.com to stake.
            </p>
          </div>
        )}

        <div className="flex items-start gap-3 rounded-xl border border-tc-amber/30 bg-tc-amber/5 px-4 py-3">
          <span className="text-lg shrink-0" aria-hidden="true">⚠️</span>
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
            <Button asChild variant="outline" className="w-full h-12">
              <a
                href="https://www.socios.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                Stake more on Socios.com
              </a>
            </Button>
            <Button
              variant="ghost"
              className="w-full text-muted-foreground"
              onClick={() => refetchTokens()}
            >
              I&apos;ve staked more — refresh
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
