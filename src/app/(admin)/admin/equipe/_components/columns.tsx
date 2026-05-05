"use client";

import { ColumnDef } from "@tanstack/react-table";
import { UserListItem } from "@/services/users/users.service";
import { Badge } from "@/components/ui/badge";
import AvatarUsers from "@/components/avatar-users";
import { calculateAge } from "@/lib/date-utils";
import { ButtonLink } from "@/components/ui/button-link";
import { IconPencil } from "@tabler/icons-react";

export const columns: ColumnDef<UserListItem>[] = [
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
        cell: ({ row, table }) => {
            const currentUserId = (table.options.meta as { currentUserId?: string } | undefined)?.currentUserId;
            const isYou = Boolean(currentUserId && row.original.id === currentUserId);
            return (
                <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{row.original.name}</span>
                        {isYou && (
                            <Badge
                                variant="outline"
                                className="text-[0.65rem] font-semibold uppercase tracking-wide border-primary/40 bg-primary/10 text-primary"
                            >
                                Você
                            </Badge>
                        )}
                    </div>
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
    {
        id: "actions",
        cell: ({ row }) => {
            return (
                <div className="flex justify-end">
                    <ButtonLink href={`/admin/equipe/${row.original.id}/editar`} variant="ghost" size="icon">
                        <IconPencil className="size-4" />
                        <span className="sr-only">Editar</span>
                    </ButtonLink>
                </div>
            );
        },
    },
];
