"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Check, Copy, Loader2 } from "lucide-react";
import { InsetHeader } from "@/components/layout/InsetHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { useUser } from "@/features/user/data-access/queries/use-user";
import { useUserTokens } from "@/features/user/data-access/queries/use-user-tokens";
import {
  useSetFantasyName,
  FantasyNameTakenError,
} from "@/features/user/data-access/mutations/use-set-fantasy-name";
import { useCurrentUserId } from "@/providers/UserSessionProvider";
import { fakeWalletFromUserId } from "@/lib/user-session";
import { getTotalStaked } from "@/features/user/lib/tokens";

const schema = z.object({
  fantasyName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(20, "Name must be 20 characters or less")
    .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers and underscores"),
});

type FormValues = z.infer<typeof schema>;

export function AccountPage() {
  useAuthGuard();
  const userId = useCurrentUserId();
  const { data: user } = useUser();
  const { data: userTokens = [] } = useUserTokens();
  const setFantasyName = useSetFantasyName();

  const [savedFlag, setSavedFlag] = useState(false);
  const [uuidCopied, setUuidCopied] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setError,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: { fantasyName: user?.fantasy_name ?? "" },
  });

  const nameValue = watch("fantasyName");
  const isSubmitting = setFantasyName.isPending;

  async function onSubmit({ fantasyName }: FormValues) {
    try {
      await setFantasyName.mutateAsync(fantasyName);
      setSavedFlag(true);
      reset({ fantasyName }); // mark form clean
      setTimeout(() => setSavedFlag(false), 2000);
    } catch (err) {
      if (err instanceof FantasyNameTakenError) {
        setError("fantasyName", {
          message: "That name is already taken. Try another.",
        });
      } else {
        setError("fantasyName", {
          message:
            err instanceof Error
              ? `Couldn't save: ${err.message}`
              : "Something went wrong. Try again.",
        });
      }
    }
  }

  async function copyUuid() {
    if (!userId) return;
    try {
      await navigator.clipboard.writeText(userId);
      setUuidCopied(true);
      setTimeout(() => setUuidCopied(false), 1500);
    } catch {
      /* silent — clipboard permission denied */
    }
  }

  const totalStaked = getTotalStaked(userTokens);

  return (
    <>
      <InsetHeader backHref="/arena" title="Account" />

      <div className="mx-auto max-w-3xl w-full px-4 py-6 space-y-6">
        {/* Fantasy name */}
        <Card>
          <CardContent className="p-5 space-y-3">
            <p className="text-base font-semibold text-foreground">
              Arena name
            </p>
            <p className="text-xs text-muted-foreground">
              This name appears on every leaderboard. Letters, numbers and
              underscores only.
            </p>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-2"
              noValidate
            >
              <Input
                {...register("fantasyName")}
                autoComplete="off"
                placeholder="e.g. TurboFan99"
                className={
                  errors.fantasyName
                    ? "border-destructive focus-visible:ring-destructive"
                    : ""
                }
              />
              <div className="flex justify-between items-center px-1">
                {errors.fantasyName ? (
                  <p className="text-xs text-destructive">
                    {errors.fantasyName.message}
                  </p>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    {savedFlag ? (
                      <span className="text-tc-green inline-flex items-center gap-1">
                        <Check className="h-3 w-3" /> Saved
                      </span>
                    ) : (
                      ""
                    )}
                  </span>
                )}
                <p className="text-xs text-muted-foreground">
                  {nameValue.length}/20
                </p>
              </div>
              <Button
                type="submit"
                disabled={isSubmitting || !isDirty}
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Save changes"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Wallet details */}
        <Card>
          <CardContent className="p-5 space-y-3">
            <p className="text-base font-semibold text-foreground">
              Wallet
            </p>
            <Row label="Address">
              <span className="font-mono text-xs">
                {userId ? fakeWalletFromUserId(userId) : "—"}
              </span>
            </Row>
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground">User ID (UUID)</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 min-w-0 rounded-md border border-border bg-muted px-2.5 py-2 font-mono text-xs text-foreground break-all">
                  {userId ?? "—"}
                </code>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={copyUuid}
                  aria-label="Copy UUID"
                >
                  {uuidCopied ? (
                    <Check className="h-4 w-4 text-tc-green" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Save this somewhere — pasting it on the login screen will
                restore this account in any browser.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Tokens summary */}
        <Card>
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-base font-semibold text-foreground">
                Staked Fan Tokens
              </p>
              <p className="text-sm font-semibold tabular-nums text-foreground">
                {totalStaked.toLocaleString()} total
              </p>
            </div>
            {userTokens.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">
                No tokens staked. Visit the dev panel to simulate Socios
                holdings.
              </p>
            ) : (
              <ul className="divide-y divide-border border border-border rounded-lg overflow-hidden">
                {userTokens.map((t) => (
                  <li
                    key={t.id}
                    className="flex items-center justify-between px-3 py-2 text-sm"
                  >
                    <span className="font-mono font-medium text-foreground">
                      {t.token_symbol}
                    </span>
                    <span className="tabular-nums text-foreground">
                      {t.staked_amount.toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{children}</span>
    </div>
  );
}
