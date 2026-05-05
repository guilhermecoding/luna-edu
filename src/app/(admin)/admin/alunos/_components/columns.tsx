"use client";

import { ColumnDef } from "@tanstack/react-table";
import { StudentListItem } from "@/services/students/students.service";
import AvatarUsers from "@/components/avatar-users";
import { calculateAge } from "@/lib/date-utils";
import { ButtonLink } from "@/components/ui/button-link";
import { IconPencil } from "@tabler/icons-react";
import { maskCPF, maskPhone } from "@/lib/masks";

export const columns: ColumnDef<StudentListItem>[] = [
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
            return <span className="text-sm">{calculateAge(birthDate)} anos</span>;
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
