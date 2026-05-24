"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ThemeToggle";
import { fakeWalletFromUserId } from "@/lib/user-session";
import {
  useSetFantasyName,
  FantasyNameTakenError,
} from "@/features/user/data-access/mutations/use-set-fantasy-name";
import { useCurrentUserId } from "@/providers/UserSessionProvider";

const schema = z.object({
  fantasyName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(20, "Name must be 20 characters or less")
    .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers and underscores"),
});

type FormValues = z.infer<typeof schema>;

export default function SetupPage() {
  const router = useRouter();
  const userId = useCurrentUserId();
  const setFantasyName = useSetFantasyName();

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { fantasyName: "" },
  });

  const nameValue = useWatch({ control, name: "fantasyName" }) ?? "";
  const isSubmitting = setFantasyName.isPending;

  useEffect(() => {
    if (!userId) router.replace("/");
  }, [userId, router]);

  async function onSubmit({ fantasyName }: FormValues) {
    try {
      await setFantasyName.mutateAsync(fantasyName);
      router.replace("/arena");
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

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center px-4 bg-background">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-8">
        {/* Green check */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-tc-green/10 border-2 border-tc-green">
            <span className="text-3xl" aria-hidden="true">✓</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Wallet connected</h1>

          {/* Wallet pill */}
          <div className="flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1.5 text-xs font-mono text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-tc-green shrink-0" />
            {userId ? fakeWalletFromUserId(userId) : "—"}
          </div>
        </div>

        {/* Form */}
        <div className="w-full max-w-sm space-y-2">
          <label className="text-sm font-semibold text-foreground block">
            Choose your arena name
          </label>
          <p className="text-xs text-muted-foreground">
            This name appears on all leaderboards. Letters, numbers and
            underscores only.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full max-w-sm space-y-4"
          noValidate
        >
          <div className="space-y-1">
            <Input
              {...register("fantasyName")}
              type="text"
              placeholder="e.g. TurboFan99"
              autoFocus
              autoComplete="off"
              className={
                errors.fantasyName
                  ? "border-destructive focus-visible:ring-destructive"
                  : ""
              }
            />
            <div className="flex justify-between px-1">
              {errors.fantasyName ? (
                <p className="text-xs text-destructive">
                  {errors.fantasyName.message}
                </p>
              ) : (
                <span />
              )}
              <p className="text-xs text-muted-foreground ml-auto">
                {nameValue.length}/20
              </p>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-tc-orange hover:bg-tc-orange/90 text-white font-semibold h-12"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" />
                Saving…
              </>
            ) : (
              "Enter Token Cup →"
            )}
          </Button>
        </form>
      </div>
    </main>
  );
}
