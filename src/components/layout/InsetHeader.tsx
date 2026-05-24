"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationBell } from "@/features/notifications/components/notification-bell";

interface InsetHeaderProps {
  title?: string;
  backHref?: string;
  children?: React.ReactNode;
}

export function InsetHeader({ title, backHref, children }: InsetHeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mx-1 h-5" />
      {backHref && (
        <Button asChild variant="ghost" size="icon" className="-ml-1 h-8 w-8">
          <Link href={backHref} aria-label="Back">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
      )}

      {title && (
        <h1 className="font-semibold text-foreground truncate">{title}</h1>
      )}
      <div className="ml-auto flex items-center gap-2">
        {children}
        <NotificationBell />
        <ThemeToggle />
      </div>
    </header>
  );
}
