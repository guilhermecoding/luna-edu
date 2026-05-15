"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
} from "@/components/ui/sheet";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { IconEdit, IconLoader2, IconCalendarEvent, IconClock, IconTrash } from "@tabler/icons-react";
import { toast } from "sonner";
import { updateLessonAction, deleteLessonAction, createLessonAction } from "../actions";

export type ScheduleOption = {
    id: string;
    dayOfWeek: string;
    timeSlotId: string;
    timeSlotName: string;
    startTime: string;
    endTime: string;
    teacherId: string | null;
    teacherName: string | null;
};

interface EditLessonSheetProps {
    programSlug: string;
    periodSlug: string;
    classGroupSlug: string;
    courseCode: string;
    schedules: ScheduleOption[];
    lesson: {
        id: string;
        date: Date | string;
        topic: string;
        scheduleId?: string | null;
    };
    children: React.ReactNode;
}

const dayOfWeekLabels: Record<string, string> = {
    MONDAY: "Segunda-feira",
    TUESDAY: "Terça-feira",
    WEDNESDAY: "Quarta-feira",
    THURSDAY: "Quinta-feira",
    FRIDAY: "Sexta-feira",
    SATURDAY: "Sábado",
    SUNDAY: "Domingo",
};

export function EditLessonSheet({
    programSlug,
    periodSlug,
    classGroupSlug,
    courseCode,
    schedules,
    lesson,
    children,
}: EditLessonSheetProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    
    // Format initial date for input (YYYY-MM-DD)
    const initialDateObj = new Date(lesson.date);
    const initialDateStr = !isNaN(initialDateObj.getTime()) ? initialDateObj.toISOString().split("T")[0] : "";

    const [date, setDate] = useState(initialDateStr);
    const [topic, setTopic] = useState(lesson.topic);
    const [selectedScheduleId, setSelectedScheduleId] = useState(lesson.scheduleId || "none");

    const isNone = selectedScheduleId === "none";
    const selectedSchedule = !isNone ? schedules.find((s) => s.id === selectedScheduleId) : undefined;

    const canSubmit = date.length > 0 && topic.length >= 2 && !isSubmitting && !isDeleting;

    const handleOpenChange = (nextOpen: boolean) => {
        setOpen(nextOpen);
        if (!nextOpen) {
            // Reset to initial state on close
            setDate(initialDateStr);
            setTopic(lesson.topic);
            setSelectedScheduleId(lesson.scheduleId || "none");
        }
    };

    const handleSubmit = async () => {
        if (!canSubmit) return;
        setIsSubmitting(true);

        try {
            const result = lesson.id 
                ? await updateLessonAction(
                    programSlug,
                    periodSlug,
                    classGroupSlug,
                    courseCode,
                    {
                        lessonId: lesson.id,
                        date,
                        topic,
                        teacherId: selectedSchedule?.teacherId || "",
                        timeSlotId: selectedSchedule?.timeSlotId || "",
                        scheduleId: selectedSchedule?.id || "",
                    },
                )
                : await createLessonAction(
                    programSlug,
                    periodSlug,
                    classGroupSlug,
                    courseCode,
                    {
                        date,
                        topic,
                        teacherId: selectedSchedule?.teacherId || "",
                        timeSlotId: selectedSchedule?.timeSlotId || "",
                        scheduleId: selectedSchedule?.id || "",
                    },
                );

            if (result.success) {
                toast.success(lesson.id ? "Aula atualizada com sucesso!" : "Aula registrada com sucesso!");
                handleOpenChange(false);
                router.refresh();
            } else {
                toast.error(result.error || "Erro ao processar aula.");
            }
        } catch {
            toast.error("Erro inesperado ao processar aula.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Tem certeza que deseja apagar esta aula e as respectivas chamadas?")) return;
        
        setIsDeleting(true);
        try {
            const result = await deleteLessonAction(
                programSlug,
                periodSlug,
                classGroupSlug,
                courseCode,
                lesson.id,
            );

            if (result.success) {
                toast.success("Aula excluída com sucesso!");
                handleOpenChange(false);
                router.refresh();
            } else {
                toast.error(result.error || "Erro ao excluir aula.");
            }
        } catch {
            toast.error("Erro inesperado ao excluir aula.");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Sheet open={open} onOpenChange={handleOpenChange}>
            <SheetTrigger asChild>
                {children}
            </SheetTrigger>
            <SheetContent className="data-[side=right]:w-full data-[side=right]:sm:max-w-[50vw] flex flex-col h-full gap-0 p-0 border-l-surface-border bg-surface">
                <SheetHeader className="p-6 border-b border-surface-border bg-background/50 backdrop-blur-sm shrink-0">
                    <div className="space-y-1">
                        <SheetTitle className="text-2xl font-bold flex items-center gap-2">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                {lesson.id ? <IconEdit className="size-4 text-primary" /> : <IconCalendarEvent className="size-4 text-primary" />}
                            </div>
                            {lesson.id ? "Editar Aula" : "Registrar Aula Prevista"}
                        </SheetTitle>
                        <SheetDescription>
                            {lesson.id 
                                ? "Altere os dados da aula. O registro de presença e os horários serão atualizados automaticamente."
                                : "Confirme os dados para registrar esta aula na disciplina. Os registros de presença serão criados automaticamente."
                            }
                        </SheetDescription>
                    </div>
                </SheetHeader>

                <ScrollArea className="flex-1 min-h-0">
                    <div className="p-6 space-y-6">
                        {/* Data da Aula */}
                        <div className="space-y-2">
                            <Label htmlFor="edit-lesson-date">Data da Aula *</Label>
                            <Input
                                id="edit-lesson-date"
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                disabled={isSubmitting || isDeleting}
                                className="rounded-lg bg-background h-12"
                            />
                        </div>

                        {/* Horário (Schedule) */}
                        {schedules.length > 0 && (
                            <div className="space-y-2">
                                <Label>Horário da Grade</Label>
                                <Select
                                    value={selectedScheduleId}
                                    onValueChange={setSelectedScheduleId}
                                    disabled={isSubmitting || isDeleting}
                                >
                                    <SelectTrigger className="rounded-lg bg-background h-12">
                                        <SelectValue placeholder="Selecione um horário (opcional)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Nenhum (Aula Avulsa)</SelectItem>
                                        {schedules.map((schedule) => (
                                            <SelectItem key={schedule.id} value={schedule.id}>
                                                <div className="flex items-center gap-2">
                                                    <IconClock className="size-3.5 text-muted-foreground shrink-0" />
                                                    <span className="font-medium">
                                                        {dayOfWeekLabels[schedule.dayOfWeek] || schedule.dayOfWeek}
                                                    </span>
                                                    <span className="text-muted-foreground">•</span>
                                                    <span className="text-muted-foreground">
                                                        {schedule.startTime} - {schedule.endTime}
                                                    </span>
                                                    {schedule.teacherName && (
                                                        <>
                                                            <span className="text-muted-foreground">•</span>
                                                            <span className="text-xs text-muted-foreground">
                                                                {schedule.teacherName}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">
                                    Vincule esta aula a um horário da grade. Se não vincular, a aula será registrada como avulsa.
                                </p>
                            </div>
                        )}

                        {/* Tópico */}
                        <div className="space-y-2">
                            <Label htmlFor="edit-lesson-topic">Assunto / Tópico *</Label>
                            <Textarea
                                id="edit-lesson-topic"
                                placeholder="Ex: Introdução à Álgebra Linear"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                disabled={isSubmitting || isDeleting}
                                className="rounded-lg min-h-24 resize-none bg-background"
                                maxLength={500}
                            />
                            <p className="text-xs text-muted-foreground text-right">{topic.length}/500</p>
                        </div>
                    </div>
                </ScrollArea>

                <SheetFooter className="p-6 border-t border-surface-border bg-background/50 backdrop-blur-sm shrink-0 flex flex-col sm:flex-row sm:justify-between items-center w-full gap-4">
                    {lesson.id ? (
                        <Button 
                            variant="destructive" 
                            onClick={handleDelete} 
                            disabled={isDeleting || isSubmitting}
                            className="w-full sm:w-auto h-12 flex items-center gap-2"
                        >
                            {isDeleting ? <IconLoader2 className="size-4 animate-spin" /> : <IconTrash className="size-4" />}
                            Excluir Aula
                        </Button>
                    ) : (
                        <div /> // Spacer for flex alignment
                    )}

                    <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                        <Button variant="outline" onClick={() => handleOpenChange(false)} className="h-12 w-full sm:w-auto" disabled={isSubmitting || isDeleting}>
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={!canSubmit}
                            className="h-12 w-full sm:w-auto flex items-center gap-2"
                        >
                            {isSubmitting ? <IconLoader2 className="size-5 animate-spin" /> : (lesson.id ? <IconEdit className="size-5" /> : <IconCalendarEvent className="size-5" />)}
                            {isSubmitting ? (lesson.id ? "Salvando..." : "Registrando...") : (lesson.id ? "Salvar Alterações" : "Registrar Aula")}
                        </Button>
                    </div>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
