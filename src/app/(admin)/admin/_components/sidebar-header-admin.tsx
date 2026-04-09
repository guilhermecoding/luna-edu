import { ProgramSwitch } from "@/@types/programs-switch.type";
import { ProgramSwitcher } from "@/components/program-switcher";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { getPrograms } from "@/services/programs.service";
import { Skeleton } from "@/components/ui/skeleton";

interface SidebarHeaderAdminProps {
    programs: ProgramSwitch[];
}

export function SidebarHeaderAdminSkeleton() {
    return (
        <div className="flex justify-center">
            <div className="flex items-center gap-4">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-30" />
                    <Skeleton className="h-2 w-30" />
                </div>
            </div>
        </div>
    );
}


export async function SidebarHeaderAdmin() {
    await new Promise(resolve => setTimeout(resolve, 3000));
    const programs = await getPrograms();
    return <SidebarHeaderAdminContent programs={programs} />;
}

function SidebarHeaderAdminContent({ programs }: SidebarHeaderAdminProps) {
    if (programs.length === 0) {
        return (
            <div className="flex justify-center mt-2">
                <span className="text-xs text-muted-foreground">
                    Nenhum programa encontrado
                </span>
            </div>
        );
    }

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
