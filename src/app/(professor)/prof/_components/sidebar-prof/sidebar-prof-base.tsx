import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
    SidebarInset, SidebarTrigger,
} from "@/components/ui/sidebar";
import { Suspense } from "react";
import { SidebarHeaderProf } from "./sidebar-header-prof";
import { SidebarHeaderAdminSkeleton } from "@/app/(admin)/admin/_components/sidebar-admin/sidebar-skeletons"; // Aproveitando o skeleton
import { ProfSidebarContent, ProfSidebarFooter } from "./prof-sidebar-client";
import { ItemMenuSidebarAdmin } from "@/@types/item-menu-sidebar.type";
import { DynamicBreadcrumb } from "@/components/dynamic-breadcrumb";

export default function SidebarProfBase({
    children,
    menus,
}: {
    children: React.ReactNode;
    menus: ItemMenuSidebarAdmin[];
}) {
    return (
        <>
            <AppSidebar
                sideBarHeader={
                    <Suspense fallback={<SidebarHeaderAdminSkeleton />}>
                        <SidebarHeaderProf />
                    </Suspense>
                }
                sideBarContent={<ProfSidebarContent menus={menus} />}
                sideBarFooter={<ProfSidebarFooter />}
            />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 border-b border-surface-border">
                    <div className="flex items-center gap-2 px-4 mt-1">
                        <SidebarTrigger className="-ml-1" />
                        <Separator
                            orientation="vertical"
                            className="mr-2 data-[orientation=vertical]:h-4"
                        />
                        <DynamicBreadcrumb />
                    </div>
                </header>
                {children}
            </SidebarInset>
        </>
    );
}
