import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
    SidebarInset, SidebarTrigger,
} from "@/components/ui/sidebar";
import { Suspense } from "react";
import { SidebarHeaderAdmin } from "./sidebar-header-admin";
import { SidebarHeaderAdminSkeleton } from "./sidebar-skeletons";
import { AdminSidebarContent, AdminSidebarFooter } from "./admin-sidebar-client";
import { ItemMenuSidebarAdmin } from "@/@types/item-menu-sidebar.type";
import { DynamicBreadcrumb } from "@/components/dynamic-breadcrumb";

export default function SidebarAdminBase({
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
                        <SidebarHeaderAdmin />
                    </Suspense>
                }
                sideBarContent={<AdminSidebarContent menus={menus} />}
                sideBarFooter={<AdminSidebarFooter />}
            />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2">
                    <div className="flex items-center gap-2 px-4 mt-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator
                            orientation="vertical"
                            className="mr-2 mt-5 data-[orientation=vertical]:h-4"
                        />
                        <DynamicBreadcrumb />
                    </div>
                </header>
                {children}
            </SidebarInset>
        </>
    );
}
