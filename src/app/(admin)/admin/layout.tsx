import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { SideBarContentMenus } from "../../../components/sidebar-content";
import { NavUser } from "@/app/(admin)/admin/_components/nav-user-admin";
import { adminMenus } from "@/config/admin-menus";
import { Suspense } from "react";
import { SidebarHeaderAdmin, SidebarHeaderAdminSkeleton } from "./_components/sidebar-header-admin";

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
        <SidebarProvider>
            <AppSidebar
                sideBarHeader={
                    <Suspense fallback={<SidebarHeaderAdminSkeleton />}>
                        <SidebarHeaderAdmin />
                    </Suspense>
                }
                sideBarContent={<SideBarContentMenus menus={adminMenus} />}
                sideBarFooter={<NavUser user={user} />}
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
                <SidebarHeaderAdminSkeleton />
                {children}
            </SidebarInset>
        </SidebarProvider>
    );
}
