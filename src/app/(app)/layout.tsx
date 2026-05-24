import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { fetchUser } from "@/features/user/api/user-api";
import { userQueryKey } from "@/features/user/data-access/keys";
import { getServerUserId } from "@/lib/user-session.server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userId = await getServerUserId();
  if (!userId) redirect("/");

  // Server-side onboarding gate. Self-heals stale cookies whose user row
  // no longer exists, and forces the fantasy-name step for new users.
  const user = await fetchUser(userId);
  if (!user) redirect("/connecting");
  if (!user.fantasy_name) redirect("/setup");

  const cookieStore = await cookies();
  const sidebarOpen = cookieStore.get("sidebar_state")?.value !== "false";

  const queryClient = new QueryClient();
  // We already fetched the user — hydrate it directly into the cache
  // instead of re-fetching.
  queryClient.setQueryData(userQueryKey(userId), user);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SidebarProvider defaultOpen={sidebarOpen}>
        <AppSidebar />
        <SidebarInset className="md:peer-data-[state=expanded]:w-[calc(100%-var(--sidebar-width))] md:peer-data-[state=collapsed]:w-[calc(100%-var(--sidebar-width-icon))] w-full md:w-auto overflow-hidden">
          {children}
        </SidebarInset>
      </SidebarProvider>
    </HydrationBoundary>
  );
}
