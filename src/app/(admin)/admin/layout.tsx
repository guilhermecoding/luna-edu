import { Metadata } from "next";

import SidebarAdminBase from "./_components/sidebar-admin/sidebar-admin-base";
import { adminMenus } from "../_config/menus/admin-menus";
import { Suspense } from "react";

export const metadata: Metadata = {
    title: {
        template: "%s | LUNA (Admin)",
        default: "Administrador",
    },
    robots: {
        index: false,
        follow: false,
    },
};

export default function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <Suspense fallback={null}>
            <SidebarAdminBase menus={adminMenus}>
                {children}
            </SidebarAdminBase>
        </Suspense>
    );
}
