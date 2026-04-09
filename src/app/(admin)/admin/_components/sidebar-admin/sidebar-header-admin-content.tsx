"use client";

import { ProgramSwitch } from "@/@types/programs-switch.type";
import { ProgramSwitcher } from "@/components/program-switcher";

interface SidebarHeaderAdminProps {
    programs: ProgramSwitch[];
}

export function SidebarHeaderAdminContent({ programs }: SidebarHeaderAdminProps) {
    if (programs.length === 0) {
        return (
            <div className="flex justify-center mt-2">
                <span className="text-xs text-muted-foreground">
                    Nenhum programa encontrado
                </span>
            </div>
        );
    }

    return <ProgramSwitcher programs={programs} />;
}
