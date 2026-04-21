"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { IconLoader2 } from "@tabler/icons-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import { Controller, type SubmitHandler, useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { SHIFTS, shiftLabels } from "../../../../schema";

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
            name: "",
            code: "",
            shift: classGroup.shift,
        },
    });

    const {
        control,
        register,
        setValue,
        formState: { errors, isSubmitting, isValid, isDirty },
        setError,
        clearErrors,
    } = form;

    const subjectIdValue = useWatch({ control, name: "subjectId" });
    const nameValue = useWatch({ control, name: "name" });
    const codeValue = useWatch({ control, name: "code" });
    const selectedSubject = useMemo(
        () => subjects.find((subject) => subject.id === subjectIdValue),
        [subjects, subjectIdValue],
    );

    useEffect(() => {
        if (!selectedSubject) return;

        setValue("name", selectedSubject.name, { shouldDirty: true, shouldValidate: true });
        setValue("code", `${classGroup.slug}-${selectedSubject.code}`.toUpperCase(), {
            shouldDirty: true,
            shouldValidate: true,
        });
    }, [selectedSubject, classGroup.slug, setValue]);

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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="name">Nome da Disciplina na Turma *</Label>
                        <Input
                            id="name"
                            placeholder="Ex: Matemática"
                            {...register("name")}
                            disabled={isSubmitting}
                            aria-invalid={errors.name ? "true" : "false"}
                            className="p-5 rounded-lg bg-background"
                        />
                        {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="code">Código da Disciplina na Turma *</Label>
                        <Input
                            id="code"
                            placeholder="Ex: 1A-MAT01"
                            {...register("code", {
                                onChange: (event) =>
                                    setValue("code", event.target.value.toUpperCase(), {
                                        shouldDirty: true,
                                        shouldTouch: true,
                                        shouldValidate: true,
                                    }),
                            })}
                            disabled={isSubmitting}
                            aria-invalid={errors.code ? "true" : "false"}
                            className="p-5 rounded-lg bg-background uppercase"
                        />
                        {errors.code && <p className="text-sm text-red-600">{errors.code.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="shift">Turno *</Label>
                        <Controller
                            control={control}
                            name="shift"
                            render={({ field }) => (
                                <Select
                                    value={field.value}
                                    onValueChange={field.onChange}
                                    disabled={isSubmitting}
                                >
                                    <SelectTrigger id="shift" className="p-5 rounded-lg bg-background w-full">
                                        <SelectValue placeholder="Selecione o turno" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {SHIFTS.map((shift) => (
                                            <SelectItem key={shift} value={shift}>
                                                {shiftLabels[shift]}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.shift && <p className="text-sm text-red-600">{errors.shift.message}</p>}
                    </div>

                    <div className="p-4 border border-blue-200 dark:border-blue-800 rounded-xl bg-blue-50 dark:bg-blue-950/30 space-y-1.5 text-sm md:col-span-2">
                        <p>
                            <span className="font-semibold">Turma:</span> {classGroup.name}
                        </p>
                        <p>
                            <span className="font-semibold">Disciplina Curricular:</span> {selectedSubject.name}
                        </p>
                        <p>
                            <span className="font-semibold">Nome final:</span> {nameValue || "-"}
                        </p>
                        <p>
                            <span className="font-semibold">Código final:</span> {codeValue || "-"}
                        </p>
                    </div>
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
