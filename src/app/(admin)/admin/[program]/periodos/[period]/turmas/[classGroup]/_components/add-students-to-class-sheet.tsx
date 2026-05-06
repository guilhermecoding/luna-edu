"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconSearch, IconUserPlus, IconLoader2, IconUserCheck, IconChevronLeft, IconChevronRight, IconListCheck, IconClipboardText, IconAlertCircle } from "@tabler/icons-react";
import { getAvailableStudentsAction, enrollStudentsInClassGroupAction, findStudentsByListAction } from "@/app/(admin)/admin/alunos/actions";
import { StudentListItem } from "@/services/students/students.service";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import AvatarUsers from "@/components/avatar-users";
import { calculateAge } from "@/lib/date-utils";
import { maskCPF } from "@/lib/masks";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

interface AddStudentsToClassSheetProps {
    periodId: string;
    classGroupId: string;
    classGroupName: string;
}

type ViewMode = "list" | "bulk";

export function AddStudentsToClassSheet({
    periodId,
    classGroupId,
    classGroupName,
}: AddStudentsToClassSheetProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>("list");

    // List Mode States
    const [students, setStudents] = useState<StudentListItem[]>([]);
    const [query, setQuery] = useState("");
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Bulk Mode States
    const [bulkInput, setBulkInput] = useState("");
    const [bulkFoundStudents, setBulkFoundStudents] = useState<{ id: string, name: string, lunaId: string }[]>([]);
    const [bulkNotFound, setBulkNotFound] = useState<string[]>([]);
    const [isValidatingBulk, setIsValidatingBulk] = useState(false);

    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const fetchStudents = useCallback(async (searchQuery: string, currentPage: number) => {
        setLoading(true);
        const res = await getAvailableStudentsAction(periodId, classGroupId, searchQuery, currentPage, 10);
        if (res.success && res.students) {
            setStudents(res.students);
            setTotalPages(res.totalPages || 1);
        } else {
            toast.error(res.error || "Erro ao buscar alunos.");
        }
        setLoading(false);
    }, [periodId, classGroupId]);

    useEffect(() => {
        if (!open) {
            return;
        }

        if (viewMode === "list") {
            const timer = setTimeout(() => {
                fetchStudents(query, page);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [open, query, page, viewMode, fetchStudents]);

    const handleValidateBulk = async () => {
        if (!bulkInput.trim()) return;

        setIsValidatingBulk(true);
        const identifiers = bulkInput.split(/[\n,;]+/).map(i => i.trim()).filter(i => i.length > 0);

        const res = await findStudentsByListAction(identifiers, periodId);

        if (res.success && res.students) {
            setBulkFoundStudents(res.students.map(s => ({ id: s.id, name: s.name, lunaId: s.lunaId || "" })));
            setBulkNotFound(res.notFound || []);
            if (res.students.length === 0 && res.notFound?.length === 0) {
                toast.info("Nenhum aluno correspondente encontrado.");
            }
        } else {
            toast.error(res.error || "Erro ao validar lista.");
        }
        setIsValidatingBulk(false);
    };

    const handleOpenChange = (nextOpen: boolean) => {
        setOpen(nextOpen);

        if (nextOpen) {
            return;
        }

        setQuery("");
        setSelectedIds(new Set());
        setPage(1);
        setBulkInput("");
        setBulkFoundStudents([]);
        setBulkNotFound([]);
        setViewMode("list");
    };

    const handleEnroll = () => {
        const idsToEnroll = viewMode === "list"
            ? Array.from(selectedIds)
            : bulkFoundStudents.map(s => s.id);

        if (idsToEnroll.length === 0) return;

        startTransition(async () => {
            const res = await enrollStudentsInClassGroupAction(
                idsToEnroll,
                classGroupId,
                periodId,
            );

            if (res.success) {
                toast.success(`${idsToEnroll.length} aluno(s) enturmado(s) com sucesso!`);
                handleOpenChange(false);
                router.refresh();
            } else {
                toast.error(res.error || "Erro ao enturmar alunos.");
            }
        });
    };

    return (
        <Sheet open={open} onOpenChange={handleOpenChange}>
            <SheetTrigger asChild>
                <Button className="w-full sm:w-auto h-11 px-6 transition-all hover:scale-[1.02] active:scale-[0.98]">
                    <IconUserPlus className="size-5 mr-2" />
                    Adicionar Alunos
                </Button>
            </SheetTrigger>
            <SheetContent className="data-[side=right]:w-full data-[side=right]:sm:max-w-[50vw] flex flex-col h-full gap-0 p-0 border-l-surface-border bg-surface">
                <SheetHeader className="p-6 border-b border-surface-border bg-background/50 backdrop-blur-sm shrink-0">
                    <div className="space-y-1">
                        <SheetTitle className="text-2xl font-bold flex items-center gap-2">
                            <div className="p-2 bg-primary/10">
                                <IconUserPlus className="size-6 text-primary" />
                            </div>
                            Adicionar Alunos
                        </SheetTitle>
                        <SheetDescription>
                            Matricule alunos na turma <b>{classGroupName}</b>.
                        </SheetDescription>
                    </div>

                    <div className="mt-6 p-1 bg-surface-border/30 rounded-xl flex flex-col sm:flex-row gap-1">
                        <button
                            onClick={() => setViewMode("list")}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${viewMode === "list" ? "bg-primary-theme shadow-sm text-white" : "text-muted-foreground hover:text-white"
                                }`}
                        >
                            <IconListCheck className="size-4" />
                            Explorar Lista
                        </button>
                        <button
                            onClick={() => setViewMode("bulk")}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${viewMode === "bulk" ? "bg-primary-theme shadow-sm text-white" : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            <IconClipboardText className="size-4" />
                            Colar Lista (Lote)
                        </button>
                    </div>
                </SheetHeader>

                <ScrollArea className="flex-1 min-h-0">
                    {viewMode === "list" ? (
                        <div className="p-6 space-y-4">
                            <div className="relative group">
                                <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                                <Input
                                    placeholder="Buscar por nome, CPF ou matrícula..."
                                    value={query}
                                    onChange={(e) => {
                                        setQuery(e.target.value);
                                        setPage(1);
                                    }}
                                    className="pl-12 h-12 bg-background border-surface-border rounded-2xl focus:ring-primary/20"
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <Badge variant="secondary" className="bg-primary/5 text-primary border-none font-medium">
                                    {selectedIds.size} selecionado(s)
                                </Badge>
                                {totalPages > 1 && (
                                    <div className="flex items-center gap-1">
                                        <Button variant="outline" size="icon" className="size-8" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1 || loading}>
                                            <IconChevronLeft className="size-4" />
                                        </Button>
                                        <span className="text-xs font-medium px-2">{page} / {totalPages}</span>
                                        <Button variant="outline" size="icon" className="size-8" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || loading}>
                                            <IconChevronRight className="size-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <div className="grid gap-1">
                                {loading ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
                                        <IconLoader2 className="size-8 animate-spin text-primary" />
                                        <p>Buscando alunos...</p>
                                    </div>
                                ) : students.length > 0 ? (
                                    students.map((student) => (
                                        <div
                                            key={student.id}
                                            onClick={() => {
                                                const next = new Set(selectedIds);
                                                if (next.has(student.id)) next.delete(student.id);
                                                else next.add(student.id);
                                                setSelectedIds(next);
                                            }}
                                            className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all hover:bg-background group ${selectedIds.has(student.id) ? "bg-primary/5 ring-1 ring-primary/20" : ""
                                                }`}
                                        >
                                            <Checkbox checked={selectedIds.has(student.id)} readOnly className="rounded-lg" />
                                            <AvatarUsers genre={student.genre} age={calculateAge(student.birthDate)} className="size-10" />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold truncate">{student.name}</p>
                                                <p className="text-xs text-muted-foreground">{student.lunaId} • {maskCPF(student.cpf)}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center py-20 text-muted-foreground">Nenhum aluno encontrado.</p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="p-6 space-y-6">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-bold text-foreground">Cole a lista abaixo</p>
                                    <Badge variant="outline" className="text-[10px] uppercase tracking-wider opacity-60">Matrículas ou CPFs</Badge>
                                </div>
                                <Textarea
                                    placeholder="Ex: 2024001, 2024002, 123.456.789-00&#10;Pode separar por vírgula ou nova linha.&#10;Alunos já matriculados serão ignorados."
                                    value={bulkInput}
                                    onChange={(e) => setBulkInput(e.target.value)}
                                    className="min-h-37.5 rounded-2xl bg-background border-surface-border resize-none focus:ring-primary/20"
                                />
                                <div className="flex justify-center items-center">
                                    <Button
                                        className="w-full sm:w-auto bg-transparent border-2 border-dashed border-primary hover:bg-primary text-primary hover:text-background hover:border-solid"
                                        variant="secondary"
                                        onClick={handleValidateBulk}
                                        disabled={!bulkInput.trim() || isValidatingBulk}
                                    >
                                        {isValidatingBulk ? <IconLoader2 className="size-4 mr-2 animate-spin" /> : <IconSearch className="size-4 mr-2" />}
                                        {isValidatingBulk ? "Validando..." : "Validar Lista"}
                                    </Button>
                                </div>
                            </div>

                            {(bulkFoundStudents.length > 0 || bulkNotFound.length > 0) && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                    <div className="flex items-center justify-between border-b border-surface-border pb-2">
                                        <p className="text-sm font-bold">Resultados da Validação</p>
                                        <Badge className="bg-emerald-500/10 text-emerald-600 border-none">{bulkFoundStudents.length} encontrados</Badge>
                                    </div>

                                    {bulkFoundStudents.length > 0 && (
                                        <div className="grid gap-2">
                                            {bulkFoundStudents.map(student => (
                                                <div key={student.id} className="flex items-center gap-3 p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                                                    <IconUserCheck className="size-4 text-emerald-600" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-bold truncate">{student.name}</p>
                                                        <p className="text-[10px] text-emerald-600/70 font-mono">{student.lunaId}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {bulkNotFound.length > 0 && (
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-amber-600 px-1">
                                                <IconAlertCircle className="size-4" />
                                                <p className="text-xs font-bold uppercase tracking-tight">Não encontrados ({bulkNotFound.length})</p>
                                            </div>
                                            <div className="flex flex-wrap gap-1.5 p-3 bg-amber-500/5 rounded-xl border border-amber-500/10">
                                                {bulkNotFound.map((id, i) => (
                                                    <Badge key={i} variant="outline" className="bg-background border-amber-200 text-amber-700 font-mono text-[10px]">{id}</Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </ScrollArea>

                <SheetFooter className="p-6 border-t border-surface-border bg-background/50 backdrop-blur-sm shrink-0">
                    <div className="flex flex-col-reverse sm:flex-row items-center justify-end w-full gap-4">
                        <Button variant="outline" onClick={() => handleOpenChange(false)} className="h-12 w-full sm:w-auto">Cancelar</Button>
                        <Button
                            disabled={isPending || (viewMode === "list" ? selectedIds.size === 0 : bulkFoundStudents.length === 0)}
                            onClick={handleEnroll}
                            className="h-12 w-full sm:w-auto"
                        >
                            {isPending ? <IconLoader2 className="size-5 mr-2 animate-spin" /> : <IconUserPlus className="size-5 mr-2" />}
                            Matricular {viewMode === "list" ? selectedIds.size : bulkFoundStudents.length} aluno(s)
                        </Button>
                    </div>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
