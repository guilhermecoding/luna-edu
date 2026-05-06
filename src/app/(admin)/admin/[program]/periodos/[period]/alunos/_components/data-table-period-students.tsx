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
import { IconSearch, IconUserMinus, IconLoader2, IconAlertTriangle } from "@tabler/icons-react";
import { toast } from "sonner";
import { unlinkStudentsFromPeriodAction } from "@/app/(admin)/admin/alunos/actions";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [adminPassword, setAdminPassword] = useState("");
    const [error, setError] = useState<string | null>(null);

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
        setError(null);
        startTransition(async () => {
            const studentIds = selectedRows.map((row) => (row.original as { id: string }).id);
            const res = await unlinkStudentsFromPeriodAction(studentIds, periodId, adminPassword);

            if (res.success) {
                toast.success("Alunos desvinculados com sucesso!");
                setRowSelection({});
                setIsModalOpen(false);
                setAdminPassword("");
                router.refresh();
            } else {
                setError(res.error || "Erro ao desvincular alunos");
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
                            onClick={() => setIsModalOpen(true)}
                            disabled={isPending}
                            className="w-full sm:w-auto h-10 px-4 text-sm rounded-full animate-in fade-in zoom-in duration-200"
                        >
                            <IconUserMinus className="size-4 mr-2" />
                            Desvincular ({selectedRows.length})
                        </Button>
                    )}
                </div>
            </div>

            <Dialog
                open={isModalOpen}
                onOpenChange={(open) => {
                    setIsModalOpen(open);
                    if (!open) {
                        setAdminPassword("");
                        setError(null);
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-destructive">
                            <IconAlertTriangle className="size-5" />
                            Confirmar Desvinculação
                        </DialogTitle>
                        <DialogDescription>
                            Você está prestes a desvincular <b>{selectedRows.length} aluno{selectedRows.length > 1 ? "s" : ""}</b> deste período.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="bg-destructive/10 p-4 rounded-xl space-y-2">
                        <p className="text-sm font-bold text-destructive flex items-center gap-2 uppercase tracking-wide">
                            <IconAlertTriangle className="size-4" />
                            Atenção: Consequências
                        </p>
                        <p className="text-sm text-destructive/80 leading-relaxed">
                            Esta ação removerá <b>permanentemente</b> todas as matrículas, notas e presenças vinculadas a este período.
                            Os dados cadastrais do aluno no sistema não serão afetados.
                        </p>
                    </div>

                    <div className="flex flex-col items-center text-center gap-4 py-4">
                        <div className="space-y-2 w-full text-left">
                            <Label htmlFor="confirm-password">Para confirmar, digite sua senha de administrador:</Label>
                            <Input
                                id="confirm-password"
                                type="password"
                                value={adminPassword}
                                onChange={(e) => setAdminPassword(e.target.value)}
                                placeholder="••••••••"
                                className="rounded-xl h-12"
                                disabled={isPending}
                                autoFocus
                            />
                            {error && <p className="text-sm text-red-600 font-medium animate-in fade-in slide-in-from-top-1">{error}</p>}
                        </div>
                    </div>

                    <DialogFooter className="gap-3 flex flex-col-reverse sm:flex-row">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsModalOpen(false)}
                            disabled={isPending}
                            className="h-11"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleUnlink}
                            disabled={!adminPassword || isPending}
                            className="h-11 px-8"
                        >
                            {isPending && <IconLoader2 className="size-4 mr-2 animate-spin" />}
                            {isPending ? "Processando..." : "Desvincular"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

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
