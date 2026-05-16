"use client";

import { ProgramSwitcher } from "@/components/program-switcher";
import { Program } from "@/generated/prisma/client";

interface SidebarHeaderProfProps {
    programs: Pick<Program, "name" | "slug">[];
}

export function SidebarHeaderProfContent({ programs }: SidebarHeaderProfProps) {
    if (programs.length === 0) {
        return (
            <div className="flex justify-center mt-2">
                <span className="text-xs text-muted-foreground">
                    Nenhum programa vinculado
                </span>
            </div>
        );
    }

    return <ProgramSwitcher programs={programs} baseUrl="/prof" showCreateOption={false} />;
}
