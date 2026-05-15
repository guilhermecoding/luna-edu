import * as React from "react";
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { SidebarHeaderProfContent } from "./sidebar-header-prof-content";

export function SidebarHeaderProf() {
  return (
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
           <SidebarHeaderProfContent />
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
  );
}
