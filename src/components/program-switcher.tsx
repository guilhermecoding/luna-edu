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
import { usePathname } from "next/navigation";

const ACTIVE_PROGRAM_STORAGE_KEY = "active_program_slug";
const ACTIVE_PROGRAM_COOKIE_NAME = "active_program_slug";
const ACTIVE_PROGRAM_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function getProgramSlugFromPath(pathname: string) {
    const [, adminSegment, possibleSlug] = pathname.split("/");
    if (adminSegment !== "admin" || !possibleSlug || possibleSlug === "programas") {
        return null;
    }

    return possibleSlug;
}

export function ProgramSwitcher({
    programs,
}: {
    programs: Pick<Program, "name" | "slug">[]
}) {
    const { isMobile, setOpenMobile } = useSidebar();
    const pathname = usePathname();
    const [activeProgram, setActiveProgram] = React.useState(programs[0]);

    const persistActiveProgram = React.useCallback((slug: string) => {
        if (typeof window === "undefined") {
            return;
        }

        localStorage.setItem(ACTIVE_PROGRAM_STORAGE_KEY, slug);
        document.cookie = `${ACTIVE_PROGRAM_COOKIE_NAME}=${encodeURIComponent(slug)}; path=/; max-age=${ACTIVE_PROGRAM_COOKIE_MAX_AGE}`;
    }, []);

    React.useEffect(() => {
        if (!programs.length) {
            return;
        }

        const slugFromPath = getProgramSlugFromPath(pathname);
        const programFromPath = slugFromPath
            ? programs.find((program) => program.slug === slugFromPath)
            : undefined;

        if (programFromPath) {
            setActiveProgram(programFromPath);
            persistActiveProgram(programFromPath.slug);
            return;
        }

        const storedSlug = typeof window === "undefined"
            ? null
            : localStorage.getItem(ACTIVE_PROGRAM_STORAGE_KEY);
        const storedProgram = storedSlug
            ? programs.find((program) => program.slug === storedSlug)
            : undefined;

        if (storedProgram) {
            setActiveProgram(storedProgram);
            return;
        }

        setActiveProgram(programs[0]);
        persistActiveProgram(programs[0].slug);
    }, [pathname, programs, persistActiveProgram]);

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
                                key={program.slug}
                                onClick={() => {
                                    setActiveProgram(program);
                                    persistActiveProgram(program.slug);
                                    if (isMobile) {
                                        setOpenMobile(false);
                                    }
                                }}
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
                        <DropdownMenuItem
                            className="gap-2 p-2"
                            onClick={() => {
                                if (isMobile) {
                                    setOpenMobile(false);
                                }
                            }}
                        >
                            <Link href="/admin/programas/novo" className="font-medium text-muted-foreground w-full flex flex-row items-center gap-2">
                                <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                                    <IconPlus className="size-4" />
                                </div>
                                Adicionar programa
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
