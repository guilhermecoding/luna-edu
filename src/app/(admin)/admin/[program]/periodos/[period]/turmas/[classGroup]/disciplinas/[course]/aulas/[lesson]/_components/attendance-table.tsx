"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconCheck, IconDeviceFloppy, IconLoader2, IconSearch, IconX } from "@tabler/icons-react";
import { toast } from "sonner";
import { bulkUpdateAttendanceAction } from "../../../actions";
import type { AttendanceWithStudent } from "@/services/lessons/lessons.service";
import AvatarUsers from "@/components/avatar-users";
import { calculateAge } from "@/lib/date-utils";
import { maskCPF } from "@/lib/masks";

interface AttendanceTableProps {
    attendances: AttendanceWithStudent[];
    courseId: string;
    lessonId: string;
}

export function AttendanceTable({ attendances: initialAttendances, courseId, lessonId }: AttendanceTableProps) {
    const [attendances, setAttendances] = useState(initialAttendances);
    const [search, setSearch] = useState("");
    const [isPending, startTransition] = useTransition();
    const [hasChanges, setHasChanges] = useState(false);

    // Mapa de mudanças locais
    const [localChanges, setLocalChanges] = useState<Record<string, boolean>>({});

    const filtered = useMemo(() => {
        if (!search.trim()) return attendances;
        const q = search.toLowerCase().trim();
        return attendances.filter(
            (a) =>
                a.student.name.toLowerCase().includes(q) ||
                a.student.cpf.includes(q) ||
                (a.student.lunaId && a.student.lunaId.includes(q)),
        );
    }, [attendances, search]);

    const togglePresence = useCallback((attendanceId: string, current: boolean) => {
        setLocalChanges((prev) => ({ ...prev, [attendanceId]: !current }));
        setAttendances((prev) =>
            prev.map((a) =>
                a.id === attendanceId ? { ...a, isPresent: !current } : a,
            ),
        );
        setHasChanges(true);
    }, []);

    const markAllPresent = useCallback(() => {
        const changes: Record<string, boolean> = {};
        setAttendances((prev) =>
            prev.map((a) => {
                if (!a.isPresent) {
                    changes[a.id] = true;
                }
                return { ...a, isPresent: true };
            }),
        );
        setLocalChanges((prev) => ({ ...prev, ...changes }));
        setHasChanges(true);
    }, []);

    const markAllAbsent = useCallback(() => {
        const changes: Record<string, boolean> = {};
        setAttendances((prev) =>
            prev.map((a) => {
                if (a.isPresent) {
                    changes[a.id] = false;
                }
                return { ...a, isPresent: false };
            }),
        );
        setLocalChanges((prev) => ({ ...prev, ...changes }));
        setHasChanges(true);
    }, []);

    const saveChanges = useCallback(() => {
        const changedIds = Object.keys(localChanges);
        if (changedIds.length === 0) return;

        const updates = changedIds.map((id) => ({
            id,
            isPresent: localChanges[id],
        }));

        startTransition(async () => {
            const result = await bulkUpdateAttendanceAction(courseId, lessonId, { updates });
            if (result.success) {
                toast.success("Presenças salvas com sucesso!");
                setLocalChanges({});
                setHasChanges(false);
            } else {
                toast.error(result.error || "Erro ao salvar presenças.");
            }
        });
    }, [localChanges, courseId, lessonId]);

    const presentCount = attendances.filter((a) => a.isPresent).length;
    const absentCount = attendances.length - presentCount;

    return (
        <div className="space-y-4">
            {/* Barra superior: busca + ações em lote */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                <div className="relative flex-1 w-full sm:max-w-md">
                    <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar aluno..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={markAllPresent}
                        className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                    >
                        <IconCheck className="size-4 mr-1" />
                        Todos Presentes
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={markAllAbsent}
                        className="text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/30"
                    >
                        <IconX className="size-4 mr-1" />
                        Todos Ausentes
                    </Button>
                </div>
            </div>

            {/* Resumo */}
            <div className="flex gap-4 text-sm">
                <span className="text-muted-foreground">
                    Total: <span className="font-bold text-foreground">{attendances.length}</span>
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="size-2.5 rounded-full bg-emerald-500" />
                    <span className="text-muted-foreground">Presentes:</span>
                    <span className="font-bold text-emerald-600">{presentCount}</span>
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="size-2.5 rounded-full bg-red-500" />
                    <span className="text-muted-foreground">Ausentes:</span>
                    <span className="font-bold text-red-600">{absentCount}</span>
                </span>
            </div>

            {/* Tabela */}
            <div className="overflow-x-auto rounded-2xl border border-surface-border bg-surface">
                <table className="w-full text-left border-collapse text-sm">
                    <thead className="bg-primary/5 text-muted-foreground uppercase text-[10px] sm:text-xs">
                        <tr>
                            <th className="px-4 sm:px-6 py-3 font-medium w-12 text-center"></th>
                            <th className="px-4 sm:px-6 py-3 font-medium">Aluno</th>
                            <th className="px-4 sm:px-6 py-3 font-medium text-center">Matrícula</th>
                            <th className="px-4 sm:px-6 py-3 font-medium text-center w-32">Presença</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-border">
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                                    {search ? "Nenhum aluno encontrado." : "Nenhum aluno matriculado."}
                                </td>
                            </tr>
                        ) : (
                            filtered.map((attendance, index) => (
                                <tr
                                    key={attendance.id}
                                    className="hover:bg-muted/30 transition-colors"
                                >
                                    <td className="px-4 sm:px-6 py-3">
                                        <div className="flex justify-center">
                                            <AvatarUsers
                                                genre={attendance.student.genre}
                                                age={calculateAge(attendance.student.birthDate)}
                                                className="size-10"
                                            />
                                        </div>
                                    </td>
                                    <td className="px-4 sm:px-6 py-3">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-foreground">
                                                {attendance.student.name}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {maskCPF(attendance.student.cpf)}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 sm:px-6 py-3 text-center">
                                        <span className="text-xs font-mono text-muted-foreground">
                                            {attendance.student.lunaId || "—"}
                                        </span>
                                    </td>
                                    <td className="px-4 sm:px-6 py-3 text-center">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                togglePresence(attendance.id, attendance.isPresent)
                                            }
                                            className={`
                                                inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold
                                                transition-all duration-150 cursor-pointer select-none
                                                ${attendance.isPresent
                                                    ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-400 dark:hover:bg-emerald-900/60"
                                                    : "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/40 dark:text-red-400 dark:hover:bg-red-900/60"
                                                }
                                            `}
                                        >
                                            {attendance.isPresent ? (
                                                <>
                                                    <IconCheck className="size-3.5" />
                                                    Presente
                                                </>
                                            ) : (
                                                <>
                                                    <IconX className="size-3.5" />
                                                    Ausente
                                                </>
                                            )}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Botão Salvar fixo */}
            {hasChanges && (
                <div className="sticky bottom-6 flex justify-end animate-in slide-in-from-bottom-4 fade-in duration-300">
                    <Button
                        type="button"
                        onClick={saveChanges}
                        disabled={isPending}
                        className="h-12 px-8 w-full sm:w-auto rounded-full shadow-lg shadow-primary/20 dark:shadow-black/20 text-base font-semibold"
                    >
                        {isPending ? (
                            <IconLoader2 className="size-5 animate-spin mr-2" />
                        ) : (
                            <IconDeviceFloppy className="size-5 mr-2" />
                        )}
                        {isPending ? "Salvando..." : "Salvar Presenças"}
                    </Button>
                </div>
            )}
        </div>
    );
}
