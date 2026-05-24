import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { fetchMatchLeaderboard } from "@/features/leaderboard/api/leaderboard-api";
import { matchLeaderboardQueryKey } from "@/features/leaderboard/data-access/keys";
import { MatchBoard } from "@/features/leaderboard/pages/match-board";

type SearchParams = Promise<{ match?: string }>;

export default async function Page({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { match } = await searchParams;

  if (!match) {
    return <MatchBoard initialMatchId={match} />;
  }

  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: matchLeaderboardQueryKey(match),
    queryFn: () => fetchMatchLeaderboard(match),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MatchBoard initialMatchId={match} />
    </HydrationBoundary>
  );
}
