"use client";

import { ColumnDef } from "@tanstack/react-table";
import { UserListItem } from "@/services/users/users.service";
import { Badge } from "@/components/ui/badge";

export const columns: ColumnDef<UserListItem>[] = [
    {
        accessorKey: "",
        header: "avatar",
        cell: ({ row }) => {
            return <span className="font-mono text-sm text-center">{row.original.id}</span>;
        },
    },
    {
        accessorKey: "name",
        header: "Nome",
        cell: ({ row }) => {
            return (
                <div className="flex flex-col">
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
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => {
            const isActive = row.original.isActive;
            return (
                <Badge variant={isActive ? "default" : "secondary"} className={isActive ? "bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25" : ""}>
                    {isActive ? "Ativado" : "Desativado"}
                </Badge>
            );
        },
    },
    {
        id: "role",
        header: "Função",
        cell: ({ row }) => {
            const { isAdmin, isTeacher } = row.original;

            if (isAdmin && isTeacher) {
                return <Badge variant="outline" className="text-indigo-500 border-indigo-200 bg-indigo-500/10">Admin & Prof</Badge>;
            }
            if (isAdmin) {
                return <Badge variant="outline" className="text-rose-500 border-rose-200 bg-rose-500/10">Admin</Badge>;
            }
            if (isTeacher) {
                return <Badge variant="outline" className="text-amber-500 border-amber-200 bg-amber-500/10">Professor</Badge>;
            }

            return <Badge variant="outline">Usuário</Badge>;
        },
    },
    {
        accessorKey: "systemRole",
        header: "Nível de Acesso",
        cell: ({ row }) => {
            const role = row.original.systemRole;
            return (
                <span className="text-sm font-medium">
                    {role === "FULL_ACCESS" ? "Acesso Total" : "Somente Leitura"}
                </span>
            );
        },
    },
];
