"use client";

import { ColumnDef } from "@tanstack/react-table";
import { StudentListItem, StudentPeriodListItem } from "@/services/students/students.service";
import AvatarUsers from "@/components/avatar-users";
import { calculateAge } from "@/lib/date-utils";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconPencil, IconDotsVertical, IconUsers } from "@tabler/icons-react";
import { maskCPF, maskPhone } from "@/lib/masks";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";

export function createPeriodStudentColumns(opts: {
    onTurmasClick: (student: StudentPeriodListItem) => void;
}): ColumnDef<StudentPeriodListItem>[] {
    const { onTurmasClick } = opts;

    return [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected()}
                    onChange={(e) => table.toggleAllPageRowsSelected(!!(e.target as HTMLInputElement).checked)}
                    aria-label="Selecionar todos"
                    className="translate-y-0.5"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onChange={(e) => row.toggleSelected(!!(e.target as HTMLInputElement).checked)}
                    aria-label="Selecionar linha"
                    className="translate-y-0.5"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "avatar",
            header: "",
            cell: ({ row }) => {
                const { birthDate, genre } = row.original;
                return (
                    <AvatarUsers
                        age={calculateAge(birthDate)}
                        genre={genre}
                        className="size-10"
                    />
                );
            },
        },
        {
            accessorKey: "name",
            header: "Nome",
            cell: ({ row }) => {
                return (
                    <div className="flex flex-col gap-1">
                        <span className="font-medium">{row.original.name}</span>
                        <span className="text-sm text-muted-foreground">{row.original.email}</span>
                    </div>
                );
            },
        },
        {
            accessorKey: "lunaId",
            header: "Matrícula/LunaID",
            cell: ({ row }) => {
                return <span className="font-mono text-sm text-center">{row.original.lunaId || "---"}</span>;
            },
        },
        {
            accessorKey: "cpf",
            header: "CPF",
            cell: ({ row }) => {
                return <span className="text-sm">{maskCPF(row.original.cpf)}</span>;
            },
        },
        {
            accessorKey: "studentPhone",
            header: "Telefone",
            cell: ({ row }) => {
                return <span className="text-sm">{maskPhone(row.original.studentPhone)}</span>;
            },
        },
        {
            id: "age",
            header: "Idade",
            cell: ({ row }) => {
                const birthDate = row.original.birthDate;
                return <span className="text-sm">{calculateAge(birthDate) === 1 ? "1 ano" : `${calculateAge(birthDate)} anos`}</span>;
            },
        },
        {
            id: "actions",
            header: "",
            cell: ({ row }) => {
                return (
                    <div className="flex justify-end">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button type="button" variant="ghost" size="icon-sm" aria-label="Abrir menu de ações">
                                    <IconDotsVertical className="size-6 text-muted-foreground shrink-0" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 rounded-xl border-surface-border p-1.5">
                                <DropdownMenuItem asChild>
                                    <Link
                                        href={`/admin/alunos/${row.original.id}/editar`}
                                        className="flex items-center gap-2 cursor-pointer py-2"
                                    >
                                        <IconPencil className="size-4 text-muted-foreground" />
                                        <span className="font-medium">Editar</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="flex items-center gap-2 cursor-pointer py-2"
                                    onSelect={() => onTurmasClick(row.original)}
                                >
                                    <IconUsers className="size-4 text-muted-foreground" />
                                    <span className="font-medium">Turmas Matriculadas</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            },
        },
    ];
}

/** Colunas da tabela de alunos em uma turma física (sem menu Turma). */
export const classGroupStudentsColumns: ColumnDef<StudentListItem>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected()}
                onChange={(e) => table.toggleAllPageRowsSelected(!!(e.target as HTMLInputElement).checked)}
                aria-label="Selecionar todos"
                className="translate-y-0.5"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onChange={(e) => row.toggleSelected(!!(e.target as HTMLInputElement).checked)}
                aria-label="Selecionar linha"
                className="translate-y-0.5"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "avatar",
        header: "",
        cell: ({ row }) => {
            const { birthDate, genre } = row.original;
            return (
                <AvatarUsers
                    age={calculateAge(birthDate)}
                    genre={genre}
                    className="size-10"
                />
            );
        },
    },
    {
        accessorKey: "name",
        header: "Nome",
        cell: ({ row }) => {
            return (
                <div className="flex flex-col gap-1">
                    <span className="font-medium">{row.original.name}</span>
                    <span className="text-sm text-muted-foreground">{row.original.email}</span>
                </div>
            );
        },
    },
    {
        accessorKey: "lunaId",
        header: "Matrícula/LunaID",
        cell: ({ row }) => {
            return <span className="font-mono text-sm text-center">{row.original.lunaId || "---"}</span>;
        },
    },
    {
        accessorKey: "cpf",
        header: "CPF",
        cell: ({ row }) => {
            return <span className="text-sm">{maskCPF(row.original.cpf)}</span>;
        },
    },
    {
        accessorKey: "studentPhone",
        header: "Telefone",
        cell: ({ row }) => {
            return <span className="text-sm">{maskPhone(row.original.studentPhone)}</span>;
        },
    },
    {
        id: "age",
        header: "Idade",
        cell: ({ row }) => {
            const birthDate = row.original.birthDate;
            return <span className="text-sm">{calculateAge(birthDate) === 1 ? "1 ano" : `${calculateAge(birthDate)} anos`}</span>;
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            return (
                <div className="flex justify-end">
                    <ButtonLink href={`/admin/alunos/${row.original.id}/editar`} variant="ghost" size="icon">
                        <IconPencil className="size-4" />
                        <span className="sr-only">Editar</span>
                    </ButtonLink>
                </div>
            );
        },
    },
];
