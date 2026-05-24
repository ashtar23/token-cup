# Token Cup

Token Cup is a Socios-style World Cup prediction MVP. Players connect with a simulated wallet UUID, choose a leaderboard name, verify staked Fan Tokens, submit match predictions, and compete on per-match and tournament leaderboards.

## What Is Real

- Next.js app with App Router routes and API handlers.
- Supabase-backed users, token holdings, match entries, predictions, and leaderboard views.
- football-data.org fixture sync and squad proxy support.
- Backend settlement service that scores predictions and voids entries when current stake drops below the submission snapshot.

## What Is Simulated

- Wallet connect uses a UUID and deterministic fake wallet display.
- Fan Token balances are demo rows in `user_tokens`.
- The dev panel can edit token holdings and manually settle matches in local/demo environments.
- Real Socios wallet reads and on-chain staking checks are not implemented yet.

## Core Rules

- A user must have staked Fan Tokens to enter their first match.
- For each new match, the user's total staked amount must exceed their previous match-entry snapshot.
- Holding a token for either team in the match applies a 2x points multiplier.
- Predictions are voided at settlement if the user's current stake is below their submission snapshot.

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
DEMO_ADMIN_SECRET=
```

`DEMO_ADMIN_SECRET` is required for production access to demo/admin endpoints such as manual settlement and fixture sync.
`SUPABASE_SERVICE_ROLE_KEY` is optional for the current demo schema, but should be set before tightening RLS policies.

## Verification

```bash
pnpm lint
npx tsc --noEmit
pnpm build
```
