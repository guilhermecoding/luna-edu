"use client";

import { SidebarMenuButton } from "@/components/ui/sidebar";
import { IconSchool } from "@tabler/icons-react";
import Link from "next/link";

export function SidebarHeaderProfContent() {
  return (
    <SidebarMenuButton size="lg" asChild>
      <Link href="/prof">
        <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
          <IconSchool className="size-5" />
        </div>
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="truncate font-bold">LUNA EDU</span>
          <span className="truncate text-xs text-muted-foreground">Área do Professor</span>
        </div>
      </Link>
    </SidebarMenuButton>
  );
}
