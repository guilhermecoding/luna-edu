"use client";

import * as React from "react";
import { IconSelector, IconPlus } from "@tabler/icons-react";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { Program } from "@/generated/prisma/client";

export function ProgramSwitcher({
    programs,
}: {
    programs: Pick<Program, "name" | "slug">[]
}) {
    const { isMobile } = useSidebar();
    const [activeProgram, setActiveProgram] = React.useState(programs[0]);

    if (!activeProgram) {
        return null;
    }

    // Obtém o nome da corporação a partir da variável de ambiente, ou usa um valor padrão se não estiver definida
    const corporation = process.env.NEXT_PUBLIC_NAME_CORPORATION || "Luna Edu";

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                {activeProgram.name.charAt(0)}
                            </div>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-medium">{activeProgram.name}</span>
                                <span className="truncate text-xs">{corporation}</span>
                            </div>
                            <IconSelector className="ml-auto" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        align="start"
                        side={isMobile ? "bottom" : "right"}
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="text-xs text-muted-foreground">
                            Programas
                        </DropdownMenuLabel>
                        {programs.map((program) => (
                            <DropdownMenuItem
                                key={program.name}
                                onClick={() => setActiveProgram(program)}
                                className="gap-2 p-2"
                            >
                                <Link href={`/admin/${program.slug}/periodos`} className="flex flex-row gap-2 w-full">
                                    <div className="flex size-6 shrink-0 items-center justify-center rounded-md border">
                                        {program.name.charAt(0)}
                                    </div>
                                    <div className="font-medium w-full">
                                        {program.name}
                                    </div>
                                </Link>
                            </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="gap-2 p-2">
                            <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                                <IconPlus className="size-4" />
                            </div>
                            <Link href="/admin/programas/criar" className="font-medium text-muted-foreground w-full">
                                Adicionar programa
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
