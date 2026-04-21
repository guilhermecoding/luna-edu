"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { IconLoader2 } from "@tabler/icons-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { Controller, type SubmitHandler, useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Shift } from "@/generated/prisma/client";
import { isRedirectError } from "@/lib/is-redirect-error";
import { createClassGroupSubjectAction } from "../actions";
import {
    createClassGroupSubjectSchema,
    type CreateClassGroupSubjectInput,
} from "../schema";
import { shiftLabels } from "../../../../schema";

type SubjectData = {
    id: string;
    name: string;
    code: string;
};

type ClassGroupData = {
    id: string;
    name: string;
    slug: string;
    shift: Shift;
};

interface CreateClassGroupSubjectFormProps {
    programSlug: string;
    periodSlug: string;
    classGroupSlug: string;
    classGroup: ClassGroupData;
    subjects: SubjectData[];
}

export function CreateClassGroupSubjectForm({
    programSlug,
    periodSlug,
    classGroupSlug,
    classGroup,
    subjects,
}: CreateClassGroupSubjectFormProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const form = useForm<CreateClassGroupSubjectInput>({
        resolver: zodResolver(createClassGroupSubjectSchema),
        mode: "onChange",
        defaultValues: {
            subjectId: "",
        },
    });

    const {
        control,
        formState: { errors, isSubmitting, isValid, isDirty },
        setError,
        clearErrors,
    } = form;

    const subjectIdValue = useWatch({ control, name: "subjectId" });
    const selectedSubject = useMemo(
        () => subjects.find((subject) => subject.id === subjectIdValue),
        [subjects, subjectIdValue],
    );

    const canSubmit = isValid && isDirty && !isSubmitting && subjects.length > 0;

    const onSubmit: SubmitHandler<CreateClassGroupSubjectInput> = async (data) => {
        clearErrors("root");

        try {
            const result = await createClassGroupSubjectAction(
                programSlug,
                periodSlug,
                classGroupSlug,
                data,
            );

            if (result?.success === false) {
                const params = new URLSearchParams(searchParams.toString());
                params.set("toast", "error");
                params.set("message", result.error || "Erro ao adicionar disciplina");
                router.replace(`${pathname}?${params.toString()}`, { scroll: false });

                setError("root", {
                    type: "server",
                    message: result.error || "Erro ao adicionar disciplina",
                });
                return;
            }
        } catch (error) {
            if (isRedirectError(error)) {
                throw error;
            }

            const params = new URLSearchParams(searchParams.toString());
            params.set("toast", "error");
            params.set("message", "Erro fatal ao adicionar disciplina");
            router.replace(`${pathname}?${params.toString()}`, { scroll: false });

            setError("root", {
                type: "server",
                message: "Erro fatal ao adicionar disciplina",
            });
        }
    };

    if (subjects.length === 0) {
        return (
            <div className="space-y-6">
                <div className="p-4 border-2 border-dashed border-surface-border rounded-xl bg-surface/30 text-center">
                    <p className="text-sm text-muted-foreground">
                        Todas as disciplinas disponíveis para esta matriz/série ja foram adicionadas nesta turma.
                    </p>
                </div>
                <div className="flex justify-end pt-4 border-t">
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                        Voltar
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {errors.root?.message && (
                <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg text-red-900 dark:text-red-200 text-sm">
                    {errors.root.message}
                </div>
            )}

            <div className="space-y-2">
                <Label htmlFor="subjectId">Disciplina Curricular *</Label>
                <Controller
                    control={control}
                    name="subjectId"
                    render={({ field }) => (
                        <Select value={field.value || ""} onValueChange={field.onChange} disabled={isSubmitting}>
                            <SelectTrigger id="subjectId" className="p-5 rounded-lg bg-background w-full">
                                <SelectValue placeholder="Selecione uma disciplina" />
                            </SelectTrigger>
                            <SelectContent>
                                {subjects.map((subject) => (
                                    <SelectItem key={subject.id} value={subject.id}>
                                        {subject.name} ({subject.code})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                />
                {errors.subjectId && (
                    <p className="text-sm text-red-600">{errors.subjectId.message}</p>
                )}
            </div>

            {selectedSubject && (
                <div className="p-4 border border-blue-200 dark:border-blue-800 rounded-xl bg-blue-50 dark:bg-blue-950/30 space-y-1.5 text-sm">
                    <p>
                        <span className="font-semibold">Turma:</span> {classGroup.name}
                    </p>
                    <p>
                        <span className="font-semibold">Disciplina:</span> {selectedSubject.name}
                    </p>
                    <p>
                        <span className="font-semibold">Codigo gerado:</span>{" "}
                        {`${classGroup.slug}-${selectedSubject.code}`.toUpperCase()}
                    </p>
                    <p>
                        <span className="font-semibold">Turno:</span> {shiftLabels[classGroup.shift]}
                    </p>
                </div>
            )}

            <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end pt-4 border-t items-center mt-6">
                <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
                    Cancelar
                </Button>
                <Button className="flex items-center gap-2" type="submit" disabled={!canSubmit}>
                    {isSubmitting && <IconLoader2 className="size-5 animate-spin" />}
                    {isSubmitting ? "Adicionando..." : "Adicionar Disciplina"}
                </Button>
            </div>
        </form>
    );
}
