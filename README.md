# Token Cup

Token Cup is a Socios-style World Cup prediction MVP. Players connect with a simulated wallet UUID, choose a leaderboard name, verify staked Fan Tokens, submit match predictions, read the Fan Pulse crowd signal, unlock achievements, and compete on per-match and tournament leaderboards.

## What Is Real

- Next.js app with App Router routes and API handlers.
- Supabase-backed users, token holdings, match entries, predictions, and leaderboard views.
- football-data.org fixture sync and squad proxy support.
- Backend settlement service that scores predictions and voids entries when current stake drops below the submission snapshot.
- Fan Pulse aggregation from locked predictions and token holdings.
- DB-backed achievements with server-side unlock events and Sonner toast notifications.
- Arena, match detail, stake verification, prediction, confirmation, achievements, and leaderboard flows.

## What Is Simulated

- Wallet connect uses a UUID and deterministic fake wallet display.
- Fan Token balances are demo rows in `user_tokens`.
- The dev panel can edit token holdings and manually settle matches in local/demo environments.
- Real Socios wallet reads and on-chain staking checks are not implemented yet.
- Fan Pulse seed data is demo-generated for judging, but it is stored and read through the same Supabase prediction/token tables as normal app data.

## Core Rules

- A user must have staked Fan Tokens to enter their first match.
- For each new match, the user's total staked amount must exceed their previous match-entry snapshot.
- Holding a token for either team in the match applies a 2x points multiplier.
- Predictions are voided at settlement if the user's current stake is below their submission snapshot.
- Achievements are unlocked from prediction and settlement events, stored once per user, and can be disabled with `NEXT_PUBLIC_ACHIEVEMENTS_ENABLED=false`.

## Judging Guide

Use [`docs/judging-presentation-guide.md`](docs/judging-presentation-guide.md) for the live demo script, feature walkthrough, and Q&A prep.

## Local Development

```bash
pnpm install
pnpm dev
```

Required environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
FOOTBALL_DATA_API_KEY=
CRON_SECRET=
NEXT_PUBLIC_ACHIEVEMENTS_ENABLED=
```

`SUPABASE_SERVICE_ROLE_KEY` is optional for the current demo schema, but should be set before tightening RLS policies.

## Verification

```bash
pnpm lint
npx tsc --noEmit
pnpm build
```
