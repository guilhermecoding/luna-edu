import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
    SidebarInset, SidebarTrigger,
} from "@/components/ui/sidebar";
import { adminMenus } from "@/config/admin-menus";
import { Suspense } from "react";
import { SidebarHeaderAdmin } from "./_components/sidebar-admin/sidebar-header-admin";
import { SidebarHeaderAdminSkeleton } from "./_components/sidebar-admin/sidebar-skeletons";
import { AdminSidebarContent, AdminSidebarFooter } from "./_components/admin-sidebar-client";

const user = {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
};

export default function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <AppSidebar
                sideBarHeader={
                    <Suspense fallback={<SidebarHeaderAdminSkeleton />}>
                        <SidebarHeaderAdmin />
                    </Suspense>
                }
                sideBarContent={<AdminSidebarContent menus={adminMenus} />}
                sideBarFooter={<AdminSidebarFooter />}
            />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator
                            orientation="vertical"
                            className="mr-2 mt-2 data-[orientation=vertical]:h-4"
                        />
                        <span>Administrador</span>
                    </div>
                </header>
                {children}
            </SidebarInset>
        </>
    );
}
