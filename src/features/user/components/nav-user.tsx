"use client";

import Link from "next/link";
import { ChevronsUpDown, LogOut, User as UserIcon, Wrench } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { fakeWalletFromUserId } from "@/lib/user-session";
import { useUser } from "../data-access/queries/use-user";
import { useLogout } from "../data-access/mutations/use-logout";
import { useCurrentUserId } from "@/providers/UserSessionProvider";

export function NavUser() {
  const { isMobile } = useSidebar();
  const { data: user } = useUser();
  const logout = useLogout();
  const userId = useCurrentUserId();

  const name = user?.fantasy_name ?? "Player";
  const initials = name.slice(0, 2).toUpperCase();
  const wallet =
    user?.wallet_address ?? (userId ? fakeWalletFromUserId(userId) : "—");

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg bg-primary/15">
                <AvatarFallback className="rounded-lg bg-primary/15 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{name}</span>
                <span className="truncate text-xs text-sidebar-foreground/60 font-mono">
                  {wallet}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-2 py-2 text-left text-sm normal-case tracking-normal">
                <Avatar className="h-8 w-8 rounded-lg bg-primary/15">
                  <AvatarFallback className="rounded-lg bg-primary/15 text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate font-semibold text-foreground">
                    {name}
                  </span>
                  <span className="truncate text-xs text-muted-foreground font-mono">
                    {wallet}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/account">
                  <UserIcon />
                  Account
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dev">
                  <Wrench />
                  Dev Panel
                  <span className="ml-auto text-xs text-tc-amber">demo</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => logout.mutate()}
              disabled={logout.isPending}
              className="text-destructive focus:text-destructive"
            >
              <LogOut />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
