"use client";

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useEffect, useState, useTransition, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { IconCheck, IconClock, IconSearch, IconX } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import AvatarUsers from "@/components/avatar-users";
import { maskCPF } from "@/lib/masks";
import { calculateAge } from "@/lib/date-utils";

interface StudentData {
    id: string;
    name: string;
    cpf: string;
    email: string;
    genre: string;
    birthDate: Date;
}

interface SADAccessItem {
    accessedAt: Date | null;
    student: StudentData;
}

interface SADAccessTableProps {
    data: SADAccessItem[];
    currentFilter?: "VIEWED" | "NOT_VIEWED";
}

const formatAccessTime = (date: Date) => {
    const hours = new Date(date).getHours().toString().padStart(2, "0");
    const minutes = new Date(date).getMinutes().toString().padStart(2, "0");
    return `visto em ${hours}h${minutes}`;
};

const columns: ColumnDef<SADAccessItem>[] = [
    {
        id: "avatar",
        cell: ({ row }) => (
            <AvatarUsers
                genre={row.original.student.genre as "MALE" | "FEMALE" | "NON_BINARY" | "PREFER_NOT_TO_SAY"}
                age={calculateAge(row.original.student.birthDate)}
                className="size-9"
            />
        ),
    },
    {
        id: "name",
        accessorFn: (row) => row.student.name,
        header: "Aluno",
        cell: ({ row }) => (
            <div>
                <p className="font-bold text-sm">{row.original.student.name}</p>
                <p className="text-[10px] text-muted-foreground md:hidden">{maskCPF(row.original.student.cpf)}</p>
            </div>
        ),
    },
    {
        id: "cpf",
        accessorFn: (row) => row.student.cpf,
        header: "CPF",
        cell: ({ row }) => (
            <span className="text-sm font-mono text-muted-foreground hidden md:block">
                {maskCPF(row.original.student.cpf)}
            </span>
        ),
    },
    {
        id: "email",
        accessorFn: (row) => row.student.email,
        header: "E-mail",
        cell: ({ row }) => (
            <span className="text-sm text-muted-foreground hidden lg:block">
                {row.original.student.email}
            </span>
        ),
    },
    {
        id: "status",
        header: () => <div className="text-right">Status de Acesso</div>,
        cell: ({ row }) => (
            <div className="flex justify-end">
                {row.original.accessedAt ? (
                    <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-none font-medium px-3 py-1">
                        <IconCheck className="size-3 mr-1.5" />
                        {formatAccessTime(row.original.accessedAt)}
                    </Badge>
                ) : (
                    <Badge variant="outline" className="text-muted-foreground font-normal border-dashed px-3 py-1">
                        <IconClock className="size-3 mr-1.5 opacity-50" />
                        ainda não visto
                    </Badge>
                )}
            </div>
        ),
    },
];

export function SADAccessTable({ data, currentFilter }: SADAccessTableProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    const [searchInput, setSearchInput] = useState("");
    const [globalFilter, setGlobalFilter] = useState("");

    // Filtra por status (Viewed/Not Viewed) localmente antes de passar para a tabela
    const statusFilteredData = useMemo(() => {
        if (!currentFilter) return data;
        return data.filter(item => {
            if (currentFilter === "VIEWED") return item.accessedAt !== null;
            if (currentFilter === "NOT_VIEWED") return item.accessedAt === null;
            return true;
        });
    }, [data, currentFilter]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setGlobalFilter(searchInput);
        }, 300);
        return () => clearTimeout(timeout);
    }, [searchInput]);

    // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table + React Compiler
    const table = useReactTable({
        data: statusFilteredData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        state: { globalFilter },
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn: (row, _columnId, filterValue: string) => {
            const term = filterValue.trim().toLowerCase();
            if (!term) return true;
            const cleanedTerm = term.replace(/\D/g, "");
            const student = row.original.student;
            return (
                student.name.toLowerCase().includes(term) ||
                student.email.toLowerCase().includes(term) ||
                (cleanedTerm.length > 0 && student.cpf.includes(cleanedTerm))
            );
        },
        initialState: {
            pagination: { pageSize: 10 },
        },
    });

    const handleFilter = (filter?: string) => {
        startTransition(() => {
            const params = new URLSearchParams(searchParams.toString());
            if (filter) {
                params.set("filter", filter);
            } else {
                params.delete("filter");
            }
            router.push(`${pathname}?${params.toString()}`, { scroll: false });
        });
    };

    return (
        <div className="space-y-4">
            <div className="rounded-md border border-surface-border overflow-hidden bg-background">
                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center justify-between px-4 py-3 border-b border-surface-border bg-surface">
                    <div className="w-full sm:max-w-xs flex flex-row items-center gap-2 px-4 py-1 rounded-full border border-input bg-background transition-colors focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50">
                        <IconSearch className="size-4 shrink-0 text-muted-foreground" />
                        <Input
                            placeholder="Pesquisar..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="border-none bg-transparent shadow-none outline-none focus-visible:border-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
                        />
                    </div>

                    <div className="flex items-center gap-1 p-0.5 bg-muted/50 rounded-full border border-surface-border self-start sm:self-auto">
                        <Button
                            variant={!currentFilter ? "default" : "ghost"}
                            size="sm"
                            onClick={() => handleFilter()}
                            className="rounded-full text-xs px-2 py-4"
                        >
                            Todos
                        </Button>
                        <Button
                            variant={currentFilter === "VIEWED" ? "default" : "ghost"}
                            size="sm"
                            onClick={() => handleFilter("VIEWED")}
                            className="rounded-full text-xs px-2 py-4"
                        >
                            <IconCheck className="size-3 mr-1" />
                            Visualizados
                        </Button>
                        <Button
                            variant={currentFilter === "NOT_VIEWED" ? "default" : "ghost"}
                            size="sm"
                            onClick={() => handleFilter("NOT_VIEWED")}
                            className="rounded-full text-xs px-2 py-4"
                        >
                            <IconX className="size-3 mr-1" />
                            Não vistos
                        </Button>
                    </div>
                </div>

                <Table>
                    <TableHeader className="bg-surface">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="border-surface-border">
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} className="font-semibold text-muted-foreground">
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows.length > 0 ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} className="border-surface-border hover:bg-muted/20 transition-colors">
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                                    Nenhum aluno encontrado.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between px-2">
                <div className="flex-1 text-sm text-muted-foreground">
                    Exibindo {table.getRowModel().rows.length} de {table.getFilteredRowModel().rows.length} alunos.
                </div>
                <div className="flex items-center space-x-6 lg:space-x-8">
                    <div className="flex w-25 items-center justify-center text-sm font-medium text-muted-foreground">
                        Página {table.getState().pagination.pageIndex + 1} de{" "}
                        {table.getPageCount()}
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            className="hidden h-8 w-8 p-0 lg:flex"
                            onClick={() => table.setPageIndex(0)}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <span className="text-lg">«</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <span className="text-lg">‹</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            <span className="text-lg">›</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="hidden h-8 w-8 p-0 lg:flex"
                            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                            disabled={!table.getCanNextPage()}
                        >
                            <span className="text-lg">»</span>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
