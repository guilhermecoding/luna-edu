import { adminMenus } from "../../_config/menus/admin-menus";
import SidebarAdminBase from "../_components/sidebar-admin/sidebar-admin-base";

export default function ProgramLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <SidebarAdminBase menus={adminMenus}>
            {children}
        </SidebarAdminBase>
    );
}
