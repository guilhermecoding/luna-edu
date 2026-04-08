import { ProgramSwitch } from "@/@types/programs-switch.type";
import { ProgramSwitcher } from "@/components/program-switcher";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";

interface SidebarHeaderAdminProps {
    programs: ProgramSwitch[];
}

export default function SidebarHeaderAdmin({ programs }: SidebarHeaderAdminProps) {
    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton size="lg" asChild>
                    <ProgramSwitcher programs={programs} />
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
