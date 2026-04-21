"use client";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { IconDotsVertical, IconEdit, IconEye } from "@tabler/icons-react";
import Link from "next/link";

interface CourseActionsProps {
    programSlug: string;
    periodSlug: string;
    courseCode: string;
}

export function CourseActions({ programSlug, periodSlug, courseCode }: CourseActionsProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                >
                    <IconDotsVertical className="size-6 text-muted-foreground shrink-0" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl border-surface-border p-1.5">
                <DropdownMenuItem asChild>
                    <Link
                        href={`/admin/${programSlug}/periodos/${periodSlug}/turmas/${courseCode}/editar`}
                        className="flex items-center gap-2 cursor-pointer py-2"
                    >
                        <IconEdit className="size-4 text-muted-foreground" />
                        <span className="font-medium">Editar Turma</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link
                        href={`/admin/${programSlug}/periodos/${periodSlug}/turmas/${courseCode}/editar`}
                        className="flex items-center gap-2 cursor-pointer py-2"
                    >
                        <IconEye className="size-4 text-muted-foreground" />
                        <span className="font-medium">Ver Detalhes</span>
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
