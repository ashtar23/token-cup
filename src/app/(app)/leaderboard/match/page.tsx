import { MatchBoard } from "@/features/leaderboard/pages/match-board";

type SearchParams = Promise<{ match?: string }>;

export default async function Page({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { match } = await searchParams;
  return <MatchBoard initialMatchId={match} />;
}
