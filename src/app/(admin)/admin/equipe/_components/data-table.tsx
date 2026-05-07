"use client";

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
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
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { useRouter, useSearchParams } from "next/navigation";
import { IconSearch } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    title?: React.ReactNode;
    /** Destaca a linha do usuário logado (opacidade + estilo). Requer `id` em cada linha ou `getRowUserId`. */
    currentUserId?: string | null;
    getRowUserId?: (row: TData) => string;
}

export function DataTable<TData, TValue>({
    columns,
    data,
    title,
    currentUserId,
    getRowUserId,
}: DataTableProps<TData, TValue>) {

    // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table + React Compiler
    const table = useReactTable({
        data,
        columns,
        meta: {
            currentUserId: currentUserId ?? undefined,
        },
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: {
            pagination: {
                pageSize: 10,
            },
        },
    });

    const searchParams = useSearchParams();
    const router = useRouter();
    const [query, setQuery] = useState(searchParams.get("q") || "");

    useEffect(() => {
        const timeout = setTimeout(() => {
            const params = new URLSearchParams(searchParams);
            if (query !== (searchParams.get("q") || "")) {
                if (query) {
                    params.set("q", query);
                } else {
                    params.delete("q");
                }
                router.replace(`?${params.toString()}`, { scroll: false });
            }
        }, 500);

        return () => clearTimeout(timeout);
    }, [query, router, searchParams]);

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                {title && (
                    <div className="flex-1 w-full">
                        {title}
                    </div>
                )}
                <div className="w-full sm:max-w-sm flex flex-row items-center gap-2 px-5 py-1 rounded-full border border-input bg-background transition-colors focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50 ml-auto">
                    <IconSearch className="size-4 shrink-0" />
                    <Input
                        placeholder="Pesquisar por nome..."
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        className="border-none bg-transparent shadow-none outline-none focus-visible:border-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                </div>
            </div>
            <div className="rounded-md border border-surface-border overflow-hidden bg-background">
                <Table>
                    <TableHeader className="bg-surface">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="border-surface-border">
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id} className="font-semibold text-muted-foreground">
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext(),
                                                )}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => {
                                const rowUserId = getRowUserId
                                    ? getRowUserId(row.original)
                                    : (row.original as { id: string }).id;
                                const isCurrentUser = Boolean(currentUserId && rowUserId === currentUserId);
                                return (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    data-current-user={isCurrentUser ? "true" : undefined}
                                    aria-label={isCurrentUser ? "Sua conta na lista" : undefined}
                                    className={cn(
                                        "border-surface-border",
                                        isCurrentUser && "opacity-65 bg-muted/25 hover:bg-muted/35",
                                    )}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext(),
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center text-muted-foreground"
                                >
                                    Nenhum usuário encontrado.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            
            {/* Pagination Controls */}
            <div className="flex items-center justify-between px-2">
                <div className="flex-1 text-sm text-muted-foreground">
                    Exibindo {table.getRowModel().rows.length} de {table.getFilteredRowModel ? table.getFilteredRowModel().rows.length : data.length} usuários.
                </div>
                <div className="flex items-center space-x-6 lg:space-x-8">
                    <div className="flex w-[100px] items-center justify-center text-sm font-medium text-muted-foreground">
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
                            <span className="sr-only">Ir para primeira página</span>
                            <span className="text-lg">«</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <span className="sr-only">Voltar página</span>
                            <span className="text-lg">‹</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            <span className="sr-only">Avançar página</span>
                            <span className="text-lg">›</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="hidden h-8 w-8 p-0 lg:flex"
                            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                            disabled={!table.getCanNextPage()}
                        >
                            <span className="sr-only">Ir para última página</span>
                            <span className="text-lg">»</span>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
