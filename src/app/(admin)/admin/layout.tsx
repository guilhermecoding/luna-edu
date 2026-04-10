import SidebarAdminBase from "./_components/sidebar-admin/sidebar-admin-base";
import { programMenus } from "../_config/menus/admin-programs-menus";

export default function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <SidebarAdminBase menus={programMenus}>
            {children}
        </SidebarAdminBase>
    );
}
