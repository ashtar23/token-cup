"use client";

import { memo } from "react";
import { MatchCard } from "./match-card";
import type { Match, Prediction } from "@/lib/types";

interface MatchSectionProps {
  title: string;
  matches: Match[];
  predictions: Record<string, Prediction>;
  heldTokens: string[];
}

function MatchSectionInner({
  title,
  matches,
  predictions,
  heldTokens,
}: MatchSectionProps) {
  if (matches.length === 0) return null;
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        {title}
        <span className="ml-2 text-muted-foreground/60 normal-case tracking-normal">
          ({matches.length})
        </span>
      </h2>
      <div className="grid gap-3 md:grid-cols-2">
        {matches.map((m) => (
          <MatchCard
            key={m.id}
            match={m}
            prediction={predictions[m.id]}
            heldTokens={heldTokens}
          />
        ))}
      </div>
    </section>
  );
}

export const MatchSection = memo(MatchSectionInner);
