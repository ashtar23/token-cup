import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { fetchMatches } from "@/features/matches/api/matches-api";
import { fetchTournamentLeaderboard } from "@/features/leaderboard/api/leaderboard-api";
import { MATCHES_QUERY_KEY } from "@/features/matches/data-access/keys";
import { TOURNAMENT_LEADERBOARD_QUERY_KEY } from "@/features/leaderboard/data-access/keys";
import { LeaderboardShell } from "@/features/leaderboard/components/leaderboard-shell";

export const revalidate = 30;

export default async function LeaderboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: [...MATCHES_QUERY_KEY, { group: undefined, search: undefined }],
      queryFn: () => fetchMatches(),
    }),
    queryClient.prefetchQuery({
      queryKey: TOURNAMENT_LEADERBOARD_QUERY_KEY,
      queryFn: fetchTournamentLeaderboard,
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <LeaderboardShell>{children}</LeaderboardShell>
    </HydrationBoundary>
  );
}
