import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { fetchMatches } from "@/features/matches/api/matches-api";
import { fetchUser } from "@/features/user/api/user-api";
import { fetchUserPredictions } from "@/features/predictions/api/predictions-api";
import { MATCHES_QUERY_KEY } from "@/features/matches/data-access/keys";
import { userQueryKey } from "@/features/user/data-access/keys";
import { userPredictionsQueryKey } from "@/features/predictions/data-access/keys";
import { ArenaHubPage } from "@/features/arena/pages/arena-hub-page";
import { getServerUserId } from "@/lib/user-session.server";

export const revalidate = 60;

export default async function Page() {
  const userId = await getServerUserId();
  const queryClient = new QueryClient();

  const tasks: Promise<unknown>[] = [
    queryClient.prefetchQuery({
      queryKey: [...MATCHES_QUERY_KEY, { group: undefined, search: undefined }],
      queryFn: () => fetchMatches(),
    }),
  ];
  if (userId) {
    tasks.push(
      queryClient.prefetchQuery({
        queryKey: userQueryKey(userId),
        queryFn: () => fetchUser(userId),
      }),
      queryClient.prefetchQuery({
        queryKey: userPredictionsQueryKey(userId),
        queryFn: () => fetchUserPredictions(userId),
      }),
    );
  }
  await Promise.all(tasks);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ArenaHubPage />
    </HydrationBoundary>
  );
}
