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
import { IconSearch, IconUserPlus, IconLoader2, IconUserCheck, IconX, IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { getWaitingStudentsAction, enrollStudentsInClassGroupAction } from "@/app/(admin)/admin/alunos/actions";
import { StudentListItem } from "@/services/students/students.service";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import AvatarUsers from "@/components/avatar-users";
import { calculateAge } from "@/lib/date-utils";
import { maskCPF } from "@/lib/masks";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface AddStudentsToClassSheetProps {
    periodId: string;
    classGroupId: string;
    classGroupName: string;
}

export function AddStudentsToClassSheet({
    periodId,
    classGroupId,
    classGroupName,
}: AddStudentsToClassSheetProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [students, setStudents] = useState<StudentListItem[]>([]);
    const [query, setQuery] = useState("");
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isPending, startTransition] = useTransition();
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const router = useRouter();

    const fetchStudents = useCallback(async (searchQuery: string, currentPage: number) => {
        setLoading(true);
        const res = await getWaitingStudentsAction(periodId, searchQuery, currentPage, 10);
        if (res.success && res.students) {
            setStudents(res.students);
            setTotalPages(res.totalPages || 1);
        } else {
            toast.error(res.error || "Erro ao buscar alunos.");
        }
        setLoading(false);
    }, [periodId]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (open) {
                fetchStudents(query, 1);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [open, query, fetchStudents]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
            fetchStudents(query, newPage);
        }
    };

    const handleToggleSelect = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedIds(newSet);
    };

    const handleSelectAll = () => {
        if (students.every(s => selectedIds.has(s.id))) {
            const newSet = new Set(selectedIds);
            students.forEach(s => newSet.delete(s.id));
            setSelectedIds(newSet);
        } else {
            const newSet = new Set(selectedIds);
            students.forEach(s => newSet.add(s.id));
            setSelectedIds(newSet);
        }
    };

    const handleEnroll = () => {
        if (selectedIds.size === 0) return;

        startTransition(async () => {
            const res = await enrollStudentsInClassGroupAction(
                Array.from(selectedIds),
                classGroupId,
                periodId,
            );

            if (res.success) {
                toast.success(`${selectedIds.size} aluno(s) enturmado(s) com sucesso!`);
                handleOpenChange(false);
                router.refresh();
            } else {
                toast.error(res.error || "Erro ao enturmar alunos.");
            }
        });
    };

    const handleOpenChange = (nextOpen: boolean) => {
        setOpen(nextOpen);

        if (nextOpen) {
            fetchStudents(query, 1);
            return;
        }

        setQuery("");
        setSelectedIds(new Set());
        setPage(1);
    };

    return (
        <Sheet open={open} onOpenChange={handleOpenChange}>
            <SheetTrigger asChild>
                <Button className="w-full sm:w-auto h-11 px-6 transition-all hover:scale-[1.02] active:scale-[0.98]">
                    <IconUserPlus className="size-5 mr-2" />
                    Adicionar Alunos
                </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-[70vw] flex flex-col h-full gap-0 p-0 border-l-surface-border bg-surface">
                <SheetHeader className="p-6 border-b border-surface-border bg-background/50 backdrop-blur-sm shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <SheetTitle className="text-2xl font-bold flex items-center gap-2">
                                <div className="p-2 bg-primary/10 rounded-xl">
                                    <IconUserPlus className="size-6 text-primary" />
                                </div>
                                Adicionar Alunos
                            </SheetTitle>
                            <SheetDescription>
                                Selecione os alunos em espera para matricular na turma <b>{classGroupName}</b>.
                            </SheetDescription>
                        </div>
                    </div>

                    <div className="mt-6 flex gap-2">
                        <div className="relative flex-1 group">
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
                            {query && (
                                <button
                                    onClick={() => {
                                        setQuery("");
                                        setPage(1);
                                    }}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-surface-border rounded-full transition-colors"
                                >
                                    <IconX className="size-4 text-muted-foreground" />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleSelectAll}
                                className="text-primary hover:text-primary hover:bg-primary/5 font-medium px-2 h-8"
                                disabled={loading || students.length === 0}
                            >
                                {students.length > 0 && students.every(s => selectedIds.has(s.id))
                                    ? "Desmarcar visíveis"
                                    : "Selecionar visíveis"}
                            </Button>
                            <Badge variant="secondary" className="bg-primary/5 text-primary border-none font-medium">
                                {selectedIds.size} selecionado(s) total
                            </Badge>
                        </div>
                        {totalPages > 1 && (
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="size-8 rounded-lg"
                                    onClick={() => handlePageChange(page - 1)}
                                    disabled={page === 1 || loading}
                                >
                                    <IconChevronLeft className="size-4" />
                                </Button>
                                <span className="text-xs font-medium px-2">
                                    {page} / {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="size-8 rounded-lg"
                                    onClick={() => handlePageChange(page + 1)}
                                    disabled={page === totalPages || loading}
                                >
                                    <IconChevronRight className="size-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                </SheetHeader>

                <ScrollArea className="flex-1 min-h-0">
                    <div className="p-2">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
                                <IconLoader2 className="size-8 animate-spin text-primary" />
                                <p className="animate-pulse">Buscando alunos disponíveis...</p>
                            </div>
                        ) : students.length > 0 ? (
                            <div className="grid gap-1">
                                {students.map((student) => (
                                    <div
                                        key={student.id}
                                        onClick={() => handleToggleSelect(student.id)}
                                        className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-200 hover:bg-background group ${selectedIds.has(student.id)
                                            ? "bg-primary/5 ring-1 ring-primary/20"
                                            : ""
                                            }`}
                                    >
                                        <Checkbox
                                            checked={selectedIds.has(student.id)}
                                            onClick={(e) => e.stopPropagation()}
                                            onChange={() => handleToggleSelect(student.id)}
                                            className="rounded-lg border-surface-border group-hover:border-primary transition-colors"
                                        />
                                        <AvatarUsers
                                            genre={student.genre}
                                            age={calculateAge(student.birthDate)}
                                            className="size-12 shadow-sm"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-foreground truncate group-hover:text-primary transition-colors">
                                                {student.name}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant="outline" className="font-mono text-[10px] py-0 px-1.5 font-normal border-surface-border bg-background">
                                                    {student.lunaId}
                                                </Badge>
                                                <span className="text-sm text-muted-foreground font-medium">
                                                    {maskCPF(student.cpf)}
                                                </span >
                                                <span className="text-muted-foreground text-[10px]">•</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {calculateAge(student.birthDate)} anos
                                                </span>
                                            </div>
                                        </div>
                                        {selectedIds.has(student.id) && (
                                            <div className="bg-primary p-1.5 rounded-full shadow-sm animate-in zoom-in duration-200">
                                                <IconUserCheck className="size-4 text-background" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-4">
                                <div className="p-4 bg-surface-border/50 rounded-full">
                                    <IconSearch className="size-10 opacity-20" />
                                </div>
                                <div className="text-center">
                                    <p className="font-bold text-foreground">Nenhum aluno disponível</p>
                                    <p className="text-sm mt-1">
                                        Todos os alunos do período já estão enturmados <br />
                                        ou não correspondem à sua busca.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                <SheetFooter className="p-6 border-t border-surface-border bg-background/50 backdrop-blur-sm shrink-0">
                    <div className="flex items-center justify-between w-full gap-4">
                        <Button
                            variant="outline"
                            onClick={() => handleOpenChange(false)}
                            className="flex-1 h-12 rounded-2xl border-surface-border hover:bg-surface-border/50 transition-colors"
                        >
                            Cancelar
                        </Button>
                        <Button
                            disabled={selectedIds.size === 0 || isPending}
                            onClick={handleEnroll}
                            className="flex-[2] h-12 rounded-2xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
                        >
                            {isPending ? (
                                <>
                                    <IconLoader2 className="size-5 mr-2 animate-spin" />
                                    Matriculando...
                                </>
                            ) : (
                                <>
                                    <IconUserPlus className="size-5 mr-2" />
                                    Matricular {selectedIds.size} aluno(s)
                                </>
                            )}
                        </Button>
                    </div>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
