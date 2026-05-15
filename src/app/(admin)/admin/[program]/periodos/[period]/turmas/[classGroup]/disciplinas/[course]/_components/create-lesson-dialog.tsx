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
import { IconPlus, IconLoader2, IconCalendarEvent, IconClock } from "@tabler/icons-react";
import { toast } from "sonner";
import { createLessonAction } from "../actions";

type ScheduleOption = {
    id: string;
    dayOfWeek: string;
    timeSlotId: string;
    timeSlotName: string;
    startTime: string;
    endTime: string;
    teacherId: string | null;
    teacherName: string | null;
};

interface CreateLessonSheetProps {
    programSlug: string;
    periodSlug: string;
    classGroupSlug: string;
    courseCode: string;
    schedules: ScheduleOption[];
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

export function CreateLessonSheet({
    programSlug,
    periodSlug,
    classGroupSlug,
    courseCode,
    schedules,
}: CreateLessonSheetProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [date, setDate] = useState("");
    const [topic, setTopic] = useState("");
    const [selectedScheduleId, setSelectedScheduleId] = useState("");

    const selectedSchedule = schedules.find((s) => s.id === selectedScheduleId);

    const canSubmit = date.length > 0 && topic.length >= 2 && !isSubmitting;

    const handleOpenChange = (nextOpen: boolean) => {
        setOpen(nextOpen);
        if (!nextOpen) {
            setDate("");
            setTopic("");
            setSelectedScheduleId("");
        }
    };

    const handleSubmit = async () => {
        if (!canSubmit) return;
        setIsSubmitting(true);

        try {
            const result = await createLessonAction(
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
                toast.success("Aula registrada com sucesso!");
                handleOpenChange(false);
                router.refresh();
            } else {
                toast.error(result.error || "Erro ao registrar aula.");
            }
        } catch {
            toast.error("Erro inesperado ao registrar aula.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Sheet open={open} onOpenChange={handleOpenChange}>
            <SheetTrigger asChild>
                <Button className="w-full sm:w-auto bg-transparent border-2 border-dashed border-primary hover:bg-primary text-primary hover:text-background hover:border-solid py-7 rounded-full font-medium">
                    <IconPlus className="size-5" />
                    Nova Aula
                </Button>
            </SheetTrigger>
            <SheetContent className="data-[side=right]:w-full data-[side=right]:sm:max-w-[50vw] flex flex-col h-full gap-0 p-0 border-l-surface-border bg-surface">
                <SheetHeader className="p-6 border-b border-surface-border bg-background/50 backdrop-blur-sm shrink-0">
                    <div className="space-y-1">
                        <SheetTitle className="text-2xl font-bold flex items-center gap-2">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <IconCalendarEvent className="size-4 text-primary" />
                            </div>
                            Registrar Nova Aula
                        </SheetTitle>
                        <SheetDescription>
                            Informe os dados da aula. Os registros de presença serão criados automaticamente para todos os alunos matriculados.
                        </SheetDescription>
                    </div>
                </SheetHeader>

                <ScrollArea className="flex-1 min-h-0">
                    <div className="p-6 space-y-6">
                        {/* Data da Aula */}
                        <div className="space-y-2">
                            <Label htmlFor="lesson-date">Data da Aula *</Label>
                            <Input
                                id="lesson-date"
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                disabled={isSubmitting}
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
                                    disabled={isSubmitting}
                                >
                                    <SelectTrigger className="rounded-lg bg-background h-12">
                                        <SelectValue placeholder="Selecione um horário (opcional)" />
                                    </SelectTrigger>
                                    <SelectContent>
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
                            <Label htmlFor="lesson-topic">Assunto / Tópico *</Label>
                            <Textarea
                                id="lesson-topic"
                                placeholder="Ex: Introdução à Álgebra Linear"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                disabled={isSubmitting}
                                className="rounded-lg min-h-24 resize-none bg-background"
                                maxLength={500}
                            />
                            <p className="text-xs text-muted-foreground text-right">{topic.length}/500</p>
                        </div>

                        {/* Preview */}
                        {date && topic.length >= 2 && (
                            <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl space-y-2 animate-in fade-in slide-in-from-top-2">
                                <p className="text-xs font-bold uppercase text-primary tracking-wider">Resumo da Aula</p>
                                <div className="text-sm space-y-1">
                                    <p><span className="text-muted-foreground">Data:</span> <span className="font-medium">{new Date(date + "T00:00:00").toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric", timeZone: "UTC" })}</span></p>
                                    {selectedSchedule && (
                                        <p><span className="text-muted-foreground">Horário:</span> <span className="font-medium">{selectedSchedule.startTime} - {selectedSchedule.endTime}</span></p>
                                    )}
                                    {selectedSchedule?.teacherName && (
                                        <p><span className="text-muted-foreground">Professor:</span> <span className="font-medium">{selectedSchedule.teacherName}</span></p>
                                    )}
                                    <p><span className="text-muted-foreground">Assunto:</span> <span className="font-medium">{topic}</span></p>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                <SheetFooter className="p-6 border-t border-surface-border bg-background/50 backdrop-blur-sm shrink-0">
                    <div className="flex flex-col-reverse sm:flex-row items-center justify-end w-full gap-4">
                        <Button variant="outline" onClick={() => handleOpenChange(false)} className="h-12 w-full sm:w-auto">
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={!canSubmit}
                            className="h-12 w-full sm:w-auto flex items-center gap-2"
                        >
                            {isSubmitting ? <IconLoader2 className="size-5 animate-spin" /> : <IconPlus className="size-5" />}
                            {isSubmitting ? "Registrando..." : "Registrar Aula"}
                        </Button>
                    </div>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
