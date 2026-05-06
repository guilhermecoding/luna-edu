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
import { useEffect, useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { useRouter, useSearchParams } from "next/navigation";
import { IconSearch, IconUserMinus, IconLoader2 } from "@tabler/icons-react";
import { toast } from "sonner";
import { unlinkStudentsFromPeriodAction } from "@/app/(admin)/admin/alunos/actions";

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    title?: React.ReactNode;
    periodId: string;
}

export function DataTablePeriodStudents<TData, TValue>({
    columns,
    data,
    title,
    periodId,
}: DataTableProps<TData, TValue>) {
    const [rowSelection, setRowSelection] = useState({});
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [query, setQuery] = useState(searchParams.get("q") || "");

    // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table + React Compiler
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onRowSelectionChange: setRowSelection,
        state: {
            rowSelection,
        },
        initialState: {
            pagination: {
                pageSize: 10,
            },
        },
    });

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

    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const hasSelection = selectedRows.length > 0;

    const handleUnlink = () => {
        if (!hasSelection) return;

        const studentIds = selectedRows.map((row) => (row.original as { id: string }).id);
        const names = selectedRows.map((row) => (row.original as { name: string }).name).join(", ");

        if (!confirm(`Tem certeza que deseja desvincular ${selectedRows.length} aluno(s) deste período?\n\nAlunos: ${names}\n\nIsso removerá também todas as matrículas, notas e presenças vinculadas a este período.`)) {
            return;
        }

        startTransition(async () => {
            const res = await unlinkStudentsFromPeriodAction(studentIds, periodId);
            if (res.success) {
                toast.success("Alunos desvinculados com sucesso!");
                setRowSelection({});
                router.refresh();
            } else {
                toast.error(res.error || "Erro ao desvincular alunos");
            }
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                {title && (
                    <div className="flex-1 w-full">
                        {title}
                    </div>
                )}

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full sm:w-auto">
                    <div className="w-full sm:max-w-sm flex flex-row items-center gap-2 px-5 py-1 rounded-full border border-input bg-background transition-colors focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50">
                        <IconSearch className="size-4 shrink-0" />
                        <Input
                            placeholder="Pesquisar..."
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            className="border-none bg-transparent shadow-none outline-none focus-visible:border-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                        />
                    </div>
                    {hasSelection && (
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleUnlink}
                            disabled={isPending}
                            className="w-full sm:w-auto h-10 px-4 text-sm rounded-full animate-in fade-in zoom-in duration-200"
                        >
                            {isPending ? (
                                <IconLoader2 className="size-4 mr-2 animate-spin" />
                            ) : (
                                <IconUserMinus className="size-4 mr-2" />
                            )}
                            Desvincular ({selectedRows.length})
                        </Button>
                    )}
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
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    className="border-surface-border"
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
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center text-muted-foreground"
                                >
                                    Nenhum aluno encontrado.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between px-2">
                <div className="flex-1 text-sm text-muted-foreground">
                    Exibindo {table.getRowModel().rows.length} de {data.length} alunos.
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
