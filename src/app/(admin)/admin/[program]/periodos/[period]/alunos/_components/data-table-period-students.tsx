"use client";

import {
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
import { useEffect, useLayoutEffect, useMemo, useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { useRouter, useSearchParams } from "next/navigation";
import { IconSearch, IconUserMinus, IconLoader2, IconAlertTriangle, IconUserPlus, IconSchool, IconChevronRight } from "@tabler/icons-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { enrollStudentsInClassGroupAction, unlinkStudentsFromPeriodAction } from "@/app/(admin)/admin/alunos/actions";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ClassGroup } from "@/generated/prisma/client";
import { StudentPeriodListItem } from "@/services/students/students.service";
import { createPeriodStudentColumns } from "./columns-period";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import Link from "next/link";

interface DataTableProps {
    data: StudentPeriodListItem[];
    title?: React.ReactNode;
    periodId: string;
    programSlug: string;
    periodSlug: string;
    classGroups?: ClassGroup[];
}

export function DataTablePeriodStudents({
    data,
    title,
    periodId,
    programSlug,
    periodSlug,
    classGroups = [],
}: DataTableProps) {
    const [rowSelection, setRowSelection] = useState({});
    const [isPending, startTransition] = useTransition();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [adminPassword, setAdminPassword] = useState("");
    const [error, setError] = useState<string | null>(null);

    const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
    const [selectedClassGroupId, setSelectedClassGroupId] = useState("");
    const [enrollError, setEnrollError] = useState<string | null>(null);
    const [turmasSheetStudent, setTurmasSheetStudent] = useState<StudentPeriodListItem | null>(null);

    const router = useRouter();
    const searchParams = useSearchParams();
    const [query, setQuery] = useState(searchParams.get("q") || "");

    const columns = useMemo(
        () =>
            createPeriodStudentColumns({
                onTurmasClick: setTurmasSheetStudent,
            }),
        [],
    );

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

    // Com cacheComponents, a rota fica oculta (Activity) em vez de desmontar; o estado do sheet seria preservado.
    // Fechamos ao ocultar, como em https://nextjs.org/docs/app/guides/preserving-ui-state
    useLayoutEffect(() => {
        return () => {
            setTurmasSheetStudent(null);
        };
    }, []);

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

    const handleEnroll = () => {
        if (!selectedClassGroupId) {
            setEnrollError("Selecione uma turma para continuar.");
            return;
        }
        setEnrollError(null);
        startTransition(async () => {
            const studentIds = selectedRows.map((row) => (row.original as { id: string }).id);
            const res = await enrollStudentsInClassGroupAction(studentIds, selectedClassGroupId, periodId);

            if (res.success) {
                toast.success("Alunos enturmados com sucesso!");
                setRowSelection({});
                setIsEnrollModalOpen(false);
                setSelectedClassGroupId("");
                router.refresh();
            } else {
                setEnrollError(res.error || "Erro ao enturmar alunos");
            }
        });
    };

    return (
        <div className="space-y-4">
            <Sheet
                open={turmasSheetStudent !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setTurmasSheetStudent(null);
                    }
                }}
            >
                <SheetContent
                    side="right"
                    className="data-[side=right]:w-full data-[side=right]:sm:max-w-md flex flex-col gap-0 border-l-surface-border bg-surface p-0"
                >
                    <SheetHeader className="p-6 border-b border-surface-border shrink-0 text-left space-y-2">
                        <SheetTitle className="text-xl font-bold flex items-center gap-2">
                            <IconSchool className="size-6" />
                            Turmas do Aluno
                        </SheetTitle>
                        <SheetDescription>
                            {turmasSheetStudent ? (
                                <span className="text-foreground font-medium">{turmasSheetStudent.name}</span>
                            ) : null}
                        </SheetDescription>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto p-6">
                        {turmasSheetStudent && turmasSheetStudent.classGroups.length === 0 && (
                            <p className="text-sm text-muted-foreground">
                                Este aluno não está em nenhuma turma neste período.
                            </p>
                        )}
                        {turmasSheetStudent && turmasSheetStudent.classGroups.length > 0 && (
                            <ul className="flex flex-col gap-2">
                                {turmasSheetStudent.classGroups.map((cg) => (
                                    <li key={cg.id}>
                                        <Link
                                            href={`/admin/${programSlug}/periodos/${periodSlug}/turmas/${cg.slug}`}
                                            onNavigate={() => setTurmasSheetStudent(null)}
                                            className="flex items-center justify-between gap-3 rounded-xl border border-surface-border bg-background px-4 py-3 text-sm font-medium transition-colors hover:bg-muted/50"
                                        >
                                            <span className="min-w-0 truncate">{cg.name}</span>
                                            <IconChevronRight className="size-4 shrink-0 text-muted-foreground" />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </SheetContent>
            </Sheet>

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
                        <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto animate-in fade-in zoom-in duration-200">
                            <Button
                                size="sm"
                                onClick={() => setIsEnrollModalOpen(true)}
                                disabled={isPending}
                                className="w-full sm:w-auto h-10 px-4 text-foreground hover:bg-green-400/50 transition-colors bg-green-200 border-green-300 dark:bg-green-900/20 dark:border-green-600/20 dark:hover:bg-green-600/20 text-sm rounded-full"
                            >
                                <IconUserPlus className="size-4 mr-2 text-primary" />
                                Enturmar ({selectedRows.length})
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setIsModalOpen(true)}
                                disabled={isPending}
                                className="w-full sm:w-auto h-10 px-4 text-sm rounded-full"
                            >
                                <IconUserMinus className="size-4 mr-2" />
                                Desvincular ({selectedRows.length})
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            <Dialog
                open={isEnrollModalOpen}
                onOpenChange={(open) => {
                    setIsEnrollModalOpen(open);
                    if (!open) {
                        setSelectedClassGroupId("");
                        setEnrollError(null);
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <IconUserPlus className="size-5 text-primary" />
                            Matricular em Turma
                        </DialogTitle>
                        <DialogDescription>
                            Você está prestes a matricular <b>{selectedRows.length} aluno{selectedRows.length > 1 ? "s" : ""}</b> em uma turma.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="class-group-select">Selecione a turma de destino:</Label>
                            <Select
                                value={selectedClassGroupId}
                                onValueChange={setSelectedClassGroupId}
                                disabled={isPending || classGroups.length === 0}
                            >
                                <SelectTrigger id="class-group-select" className="w-full bg-background rounded-xl h-12">
                                    <SelectValue placeholder={classGroups.length === 0 ? "Nenhuma turma disponível" : "Escolha uma turma..."} />
                                </SelectTrigger>
                                <SelectContent>
                                    {classGroups.map((cg) => (
                                        <SelectItem key={cg.id} value={cg.id}>
                                            {cg.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {enrollError && <p className="text-sm text-red-600 font-medium animate-in fade-in slide-in-from-top-1">{enrollError}</p>}
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Os alunos serão matriculados em <b>todas as disciplinas</b> cadastradas para a turma selecionada.
                        </p>
                    </div>

                    <DialogFooter className="gap-3 flex flex-col-reverse sm:flex-row">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsEnrollModalOpen(false)}
                            disabled={isPending}
                            className="h-11"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="button"
                            onClick={handleEnroll}
                            disabled={!selectedClassGroupId || isPending}
                            className="h-11 px-8"
                        >
                            {isPending && <IconLoader2 className="size-4 mr-2 animate-spin" />}
                            {isPending ? "Processando..." : "Matricular"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

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
