"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useUserSession } from "@/providers/UserSessionProvider";

const schema = z.object({
  userId: z
    .string()
    .min(1, "Required")
    .uuid("Must be a valid UUID (8-4-4-4-12 hex)"),
});

type FormValues = z.infer<typeof schema>;

export default function LandingPage() {
  const router = useRouter();
  const { userId: existingUserId, setUserId } = useUserSession();
  const [navigating, setNavigating] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { userId: existingUserId ?? "" },
  });

  function generateUuid() {
    setValue("userId", crypto.randomUUID(), { shouldValidate: true });
  }

  function onSubmit({ userId }: FormValues) {
    // Always go through /connecting so the user row is ensured and the
    // fantasy-name flow runs for first-time users. No client-side branching
    // here — connecting + the (app) layout decide the next step.
    setNavigating(true);
    setUserId(userId);
    router.push("/connecting");
  }

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center px-4 bg-background">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md mx-auto flex flex-col items-center gap-8 py-12">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="text-6xl" aria-hidden="true">🏆</span>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Token Cup
          </h1>
          <p className="text-sm text-muted-foreground max-w-xs">
            Predict World Cup 2026 results with your Socios Fan Tokens.
            Compete on the global leaderboard.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full space-y-3"
          noValidate
        >
          <div className="space-y-1.5">
            <label
              htmlFor="userId"
              className="text-sm font-semibold text-foreground block"
            >
              Your wallet ID
            </label>
            <p className="text-xs text-muted-foreground">
              {existingUserId
                ? "Continue with your existing session, or generate a new UUID to sign up as a different user."
                : "Paste an existing UUID to resume a session, or generate a new one to sign up."}
            </p>
            <Input
              id="userId"
              {...register("userId")}
              placeholder="00000000-0000-0000-0000-000000000000"
              autoComplete="off"
              spellCheck={false}
              disabled={navigating}
              className={`font-mono text-[13px] ${
                errors.userId
                  ? "border-destructive focus-visible:ring-destructive"
                  : ""
              }`}
            />
            <div className="flex items-center justify-between min-h-5">
              {errors.userId ? (
                <p className="text-xs text-destructive">{errors.userId.message}</p>
              ) : (
                <span />
              )}
              <button
                type="button"
                onClick={generateUuid}
                disabled={navigating}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              >
                <RefreshCw className="h-3 w-3" />
                Generate new UUID
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={navigating}
            className="w-full bg-tc-blue hover:bg-tc-blue/90 text-white font-semibold h-12"
          >
            {navigating ? (
              <>
                <Loader2 className="animate-spin" />
                Connecting…
              </>
            ) : existingUserId ? (
              "Continue"
            ) : (
              "Connect Socios Wallet"
            )}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Read-only access only. No transaction signing or fund access.
          </p>
        </form>

        <ul className="w-full space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-tc-green mt-0.5">✓</span>
            Predict match results + total goals
          </li>
          <li className="flex items-start gap-2">
            <span className="text-tc-green mt-0.5">✓</span>
            2× bonus for holding team Fan Tokens
          </li>
          <li className="flex items-start gap-2">
            <span className="text-tc-green mt-0.5">✓</span>
            1.5× multiplier on 3-match streaks
          </li>
        </ul>
      </div>
    </main>
  );
}
