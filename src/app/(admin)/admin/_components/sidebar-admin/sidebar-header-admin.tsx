import { SidebarHeaderAdminContent } from "./sidebar-header-admin-content";
import { getPrograms } from "@/services/programs.service";


export async function SidebarHeaderAdmin() {
    // await new Promise(resolve => setTimeout(resolve, 5000));
    const programs = await getPrograms();
    return <SidebarHeaderAdminContent programs={programs} />;
}
