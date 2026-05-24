"use client";

import { useState } from "react";
import { Trash2, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import { InsetHeader } from "@/components/layout/InsetHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import { Badge } from "@/components/ui/badge";

import { useMatches } from "@/features/matches/data-access/queries/use-matches";
import { useSyncMatches } from "@/features/matches/data-access/mutations/use-sync-matches";
import { useUser } from "@/features/user/data-access/queries/use-user";
import { useUserTokens } from "@/features/user/data-access/queries/use-user-tokens";
import {
  useUpsertUserToken,
  useDeleteUserToken,
} from "@/features/user/data-access/mutations/use-token-mutations";
import { useSettleMatch } from "@/features/predictions/data-access/mutations/use-settle-match";
import { useDeleteAllPredictions } from "@/features/predictions/data-access/mutations/use-delete-predictions";
import { getTotalStaked } from "@/features/user/lib/tokens";
import { useCurrentUserId } from "@/providers/UserSessionProvider";

interface Feedback {
  type: "ok" | "err";
  text: string;
}

export function DevPanel() {
  const userId = useCurrentUserId();
  const { data: user } = useUser();
  const { data: userTokens = [] } = useUserTokens();
  const { data: matches = [] } = useMatches();

  const upsertToken = useUpsertUserToken();
  const removeToken = useDeleteUserToken();
  const syncMatches = useSyncMatches();
  const settleMatch = useSettleMatch();
  const resetPredictions = useDeleteAllPredictions();

  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const totalStaked = getTotalStaked(userTokens);

  const matchOptions: ComboboxOption[] = matches.map((m) => ({
    value: m.id,
    label: `${m.home_team} vs ${m.away_team}`,
    searchHint: `${m.home_team} ${m.away_team} ${m.status}`,
    suffix: (
      <Badge variant="secondary" className="ml-2 text-xs capitalize">
        {m.status}
      </Badge>
    ),
  }));

  return (
    <>
      <InsetHeader title="Dev Panel">
        <Badge variant="outline" className="text-tc-amber border-tc-amber/40">
          Demo only
        </Badge>
      </InsetHeader>

      <div className="mx-auto max-w-3xl w-full px-4 py-6 space-y-8">
        {feedback && <FeedbackBanner feedback={feedback} onDismiss={() => setFeedback(null)} />}

        {/* ── Per-user section ─────────────────────────────────────────── */}
        <Section
          label="Your account"
          description="These actions only affect the currently connected user."
        >
          <MockUserCard user={user} totalStaked={totalStaked} userId={userId} />

          <TokenHoldingsCard
            tokens={userTokens}
            onUpsert={(symbol, amount) =>
              upsertToken.mutate(
                { symbol, amount },
                {
                  onSuccess: () =>
                    setFeedback({
                      type: "ok",
                      text: `Token ${symbol} set to ${amount.toLocaleString()}`,
                    }),
                  onError: (e) => setFeedback({ type: "err", text: e.message }),
                },
              )
            }
            onRemove={(symbol) =>
              removeToken.mutate(symbol, {
                onSuccess: () =>
                  setFeedback({ type: "ok", text: `Removed ${symbol}` }),
                onError: (e) => setFeedback({ type: "err", text: e.message }),
              })
            }
            upsertPending={upsertToken.isPending}
            removePending={removeToken.isPending}
          />

          <Card className="border-destructive/30">
            <CardContent className="p-5 space-y-3">
              <p className="text-base font-semibold text-destructive">
                Reset predictions
              </p>
              <p className="text-xs text-muted-foreground">
                Deletes every prediction tied to this UUID so you can replay
                the demo. Other users are unaffected.
              </p>
              <Button
                variant="outline"
                className="w-full border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                disabled={resetPredictions.isPending}
                onClick={() =>
                  resetPredictions.mutate(undefined, {
                    onSuccess: () =>
                      setFeedback({
                        type: "ok",
                        text: "All predictions deleted",
                      }),
                    onError: (e) =>
                      setFeedback({ type: "err", text: e.message }),
                  })
                }
              >
                <Trash2 />
                {resetPredictions.isPending
                  ? "Deleting…"
                  : "Delete all predictions"}
              </Button>
            </CardContent>
          </Card>
        </Section>

        {/* ── Global section ───────────────────────────────────────────── */}
        <Section
          label="Tournament"
          description="These actions affect every user. Settling a match scores it across the entire leaderboard."
        >
          <SettleMatchCard
            matchOptions={matchOptions}
            onSettle={(matchId, home, away) =>
              settleMatch.mutate(
                { matchId, homeScore: home, awayScore: away },
                {
                  onSuccess: (data) =>
                    setFeedback({
                      type: "ok",
                      text: `Settled ${data.settled} predictions`,
                    }),
                  onError: (e) => setFeedback({ type: "err", text: e.message }),
                },
              )
            }
            isPending={settleMatch.isPending}
          />

          <Card>
            <CardContent className="p-5 space-y-3">
              <p className="text-base font-semibold text-foreground">
                Sync fixtures
              </p>
              <p className="text-xs text-muted-foreground">
                Pulls latest WC 2026 match data from football-data.org.
                Updates the shared matches table.
              </p>
              <Button
                variant="outline"
                className="w-full"
                disabled={syncMatches.isPending}
                onClick={() =>
                  syncMatches.mutate(undefined, {
                    onSuccess: (data) =>
                      setFeedback({
                        type: "ok",
                        text: `Synced ${data.upserted}/${data.total} matches`,
                      }),
                    onError: (e) =>
                      setFeedback({ type: "err", text: e.message }),
                  })
                }
              >
                <RefreshCw className={syncMatches.isPending ? "animate-spin" : ""} />
                {syncMatches.isPending ? "Syncing…" : "Sync matches"}
              </Button>
            </CardContent>
          </Card>
        </Section>
      </div>
    </>
  );
}

function Section({
  label,
  description,
  children,
}: {
  label: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="space-y-1 px-1">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          {label}
        </h2>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function FeedbackBanner({
  feedback,
  onDismiss,
}: {
  feedback: Feedback;
  onDismiss: () => void;
}) {
  const isOk = feedback.type === "ok";
  return (
    <div
      className={`flex items-start gap-2 rounded-lg border px-4 py-3 text-sm ${
        isOk
          ? "border-tc-green/30 bg-tc-green/5 text-foreground"
          : "border-destructive/30 bg-destructive/5 text-foreground"
      }`}
    >
      {isOk ? (
        <CheckCircle2 className="h-4 w-4 shrink-0 text-tc-green mt-0.5" />
      ) : (
        <AlertCircle className="h-4 w-4 shrink-0 text-destructive mt-0.5" />
      )}
      <span className="flex-1">{feedback.text}</span>
      <button
        onClick={onDismiss}
        className="text-muted-foreground hover:text-foreground"
      >
        ×
      </button>
    </div>
  );
}

function MockUserCard({
  user,
  totalStaked,
  userId,
}: {
  user?: { fantasy_name: string | null } | null;
  totalStaked: number;
  userId: string | null;
}) {
  return (
    <Card>
      <CardContent className="p-5 space-y-2">
        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Connected User
        </p>
        <Row
          label="User ID"
          value={
            <span className="font-mono text-xs break-all">
              {userId ?? "—"}
            </span>
          }
        />
        <Row label="Fantasy name" value={user?.fantasy_name ?? "—"} />
        <Row
          label="Total staked"
          value={`${totalStaked.toLocaleString()} tokens`}
          bold
        />
      </CardContent>
    </Card>
  );
}

interface TokenHoldingsProps {
  tokens: Array<{ id: string; token_symbol: string; staked_amount: number }>;
  onUpsert: (symbol: string, amount: number) => void;
  onRemove: (symbol: string) => void;
  upsertPending: boolean;
  removePending: boolean;
}

function TokenHoldingsCard({
  tokens,
  onUpsert,
  onRemove,
  upsertPending,
  removePending,
}: TokenHoldingsProps) {
  const [symbol, setSymbol] = useState("");
  const [amount, setAmount] = useState("");

  const handleUpsert = () => {
    const sym = symbol.trim().toUpperCase();
    const amt = parseInt(amount);
    if (!sym || isNaN(amt) || amt < 0) return;
    onUpsert(sym, amt);
    setSymbol("");
    setAmount("");
  };

  return (
    <Card>
      <CardContent className="p-5 space-y-3">
        <p className="text-base font-semibold text-foreground">
          Token holdings
        </p>
        <p className="text-xs text-muted-foreground">
          Simulates fan tokens staked on Socios. Holdings determine eligibility
          and 2× bonuses.
        </p>

        {tokens.length > 0 ? (
          <ul className="divide-y divide-border border border-border rounded-lg overflow-hidden">
            {tokens.map((t) => (
              <li
                key={t.id}
                className="flex items-center justify-between px-3 py-2.5 text-base"
              >
                <span className="font-mono font-semibold text-foreground">
                  {t.token_symbol}
                </span>
                <div className="flex items-center gap-3">
                  <span className="tabular-nums text-foreground">
                    {t.staked_amount.toLocaleString()}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => onRemove(t.token_symbol)}
                    disabled={removePending}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground italic py-2">
            No tokens staked.
          </p>
        )}

        <div className="flex gap-2 pt-1">
          <Input
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            placeholder="Symbol (e.g. ARG)"
            className="w-32 uppercase"
          />
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount"
            className="flex-1"
          />
          <Button onClick={handleUpsert} disabled={upsertPending}>
            {upsertPending ? "..." : "Set"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface SettleMatchProps {
  matchOptions: ComboboxOption[];
  onSettle: (matchId: string, home: number, away: number) => void;
  isPending: boolean;
}

function SettleMatchCard({
  matchOptions,
  onSettle,
  isPending,
}: SettleMatchProps) {
  const [matchId, setMatchId] = useState("");
  const [home, setHome] = useState("");
  const [away, setAway] = useState("");

  const handleSettle = () => {
    const h = parseInt(home);
    const a = parseInt(away);
    if (!matchId || isNaN(h) || isNaN(a)) return;
    onSettle(matchId, h, a);
    setHome("");
    setAway("");
  };

  return (
    <Card>
      <CardContent className="p-5 space-y-3">
        <p className="text-base font-semibold text-foreground">
          Settle a match
        </p>
        <p className="text-xs text-muted-foreground">
          Enter the final score. Marks match settled, voids predictions where
          stake dropped, and awards points.
        </p>
        <Combobox
          options={matchOptions}
          value={matchId}
          onChange={setMatchId}
          placeholder="Pick a match…"
          searchPlaceholder="Search teams or status…"
        />
        <div className="flex gap-2 items-center">
          <Input
            type="number"
            value={home}
            onChange={(e) => setHome(e.target.value)}
            placeholder="Home"
            className="w-20"
          />
          <span className="text-muted-foreground">–</span>
          <Input
            type="number"
            value={away}
            onChange={(e) => setAway(e.target.value)}
            placeholder="Away"
            className="w-20"
          />
          <Button onClick={handleSettle} disabled={isPending} className="flex-1">
            {isPending ? "Settling…" : "Settle"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Row({
  label,
  value,
  bold = false,
}: {
  label: string;
  value: React.ReactNode;
  bold?: boolean;
}) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={bold ? "font-bold text-foreground" : "font-medium text-foreground"}>
        {value}
      </span>
    </div>
  );
}
