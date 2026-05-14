"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { IconPlus, IconLoader2 } from "@tabler/icons-react";
import { toast } from "sonner";
import { createLessonAction } from "../actions";

interface CreateLessonDialogProps {
    programSlug: string;
    periodSlug: string;
    classGroupSlug: string;
    courseCode: string;
}

export function CreateLessonDialog({
    programSlug,
    periodSlug,
    classGroupSlug,
    courseCode,
}: CreateLessonDialogProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [date, setDate] = useState("");
    const [topic, setTopic] = useState("");

    const canSubmit = date.length > 0 && topic.length >= 2 && !isSubmitting;

    const handleSubmit = async () => {
        if (!canSubmit) return;
        setIsSubmitting(true);

        try {
            const result = await createLessonAction(
                programSlug,
                periodSlug,
                classGroupSlug,
                courseCode,
                { date, topic },
            );

            if (result.success) {
                toast.success("Aula registrada com sucesso!");
                setOpen(false);
                setDate("");
                setTopic("");
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
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setDate(""); setTopic(""); } }}>
            <DialogTrigger asChild>
                <Button className="w-full sm:w-auto bg-transparent border-2 border-dashed border-primary hover:bg-primary text-primary hover:text-background hover:border-solid py-7 rounded-full font-medium">
                    <IconPlus className="size-5" />
                    Nova Aula
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Registrar Nova Aula</DialogTitle>
                    <DialogDescription>
                        Informe a data e o assunto da aula. Os registros de presença serão criados automaticamente para todos os alunos matriculados.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label htmlFor="lesson-date">Data da Aula *</Label>
                        <Input
                            id="lesson-date"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            disabled={isSubmitting}
                            className="rounded-lg"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="lesson-topic">Assunto / Tópico *</Label>
                        <Textarea
                            id="lesson-topic"
                            placeholder="Ex: Introdução à Álgebra Linear"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            disabled={isSubmitting}
                            className="rounded-lg min-h-24 resize-none"
                            maxLength={500}
                        />
                        <p className="text-xs text-muted-foreground text-right">{topic.length}/500</p>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setOpen(false)}
                        disabled={isSubmitting}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!canSubmit}
                        className="flex items-center gap-2"
                    >
                        {isSubmitting && <IconLoader2 className="size-4 animate-spin" />}
                        {isSubmitting ? "Registrando..." : "Registrar Aula"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
