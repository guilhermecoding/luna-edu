"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { useEffect } from "react";
import { editSubjectAction } from "../actions";
import { createSubjectSchema } from "../../../novo/schema";
import { IconLoader2 } from "@tabler/icons-react";
import { isRedirectError } from "@/lib/is-redirect-error";
import { Subject } from "@/generated/prisma/client";

const editSubjectSchema = createSubjectSchema;
type FormInput = z.input<typeof editSubjectSchema>;
type FormOutput = z.output<typeof editSubjectSchema>;

type Props = {
    programSlug: string;
    degreeSlug: string;
    degreeId: string;
    subjectId: string;
    initialData: Subject;
};

export function EditSubjectForm({ programSlug, degreeSlug, degreeId, subjectId, initialData }: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const form = useForm<FormInput, undefined, FormOutput>({
        resolver: zodResolver(editSubjectSchema),
        mode: "onChange",
        defaultValues: {
            name: initialData.name,
            code: initialData.code || "",
            workload: initialData.workload || undefined,
            basePeriod: initialData.basePeriod || undefined,
        },
    });

    const {
        register,
        formState: { errors, isSubmitting, isValid, isDirty },
        setError,
        clearErrors,
    } = form;

    const canSubmit = isValid && isDirty && !isSubmitting;

    useEffect(() => {
        clearErrors();
    }, [clearErrors]);

    const onSubmit: SubmitHandler<FormOutput> = async (data: FormOutput) => {
        clearErrors("root");

        try {
            const result = await editSubjectAction(subjectId, programSlug, degreeSlug, degreeId, data);
            if (result?.success === false) {
                const params = new URLSearchParams(searchParams.toString());
                params.set("toast", "error");
                params.set("message", result.error || "Erro ao editar disciplina");
                router.replace(`${pathname}?${params.toString()}`, { scroll: false });

                setError("root", {
                    type: "server",
                    message: result.error || "Erro ao editar disciplina",
                });
                return;
            }
        } catch (error) {
            if (isRedirectError(error)) {
                throw error;
            }

            const params = new URLSearchParams(searchParams.toString());
            params.set("toast", "error");
            params.set("message", "Erro fatal ao editar disciplina");
            router.replace(`${pathname}?${params.toString()}`, { scroll: false });

            setError("root", {
                type: "server",
                message: "Erro fatal ao editar disciplina",
            });
        }
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {errors.root?.message && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-900 text-sm">
                    {errors.root.message}
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="name">Nome da Disciplina *</Label>
                    <Input
                        id="name"
                        {...register("name")}
                        disabled={isSubmitting}
                        aria-invalid={errors.name ? "true" : "false"}
                        className="p-5 rounded-lg bg-background"
                    />
                    {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="code">Código Interno Único *</Label>
                    <Input
                        id="code"
                        {...register("code")}
                        disabled={isSubmitting}
                        aria-invalid={errors.code ? "true" : "false"}
                        className="p-5 rounded-lg bg-background font-mono text-sm"
                    />
                    {errors.code && <p className="text-sm text-red-600">{errors.code.message}</p>}
                </div>
                
                <div className="space-y-2">
                    <Label htmlFor="basePeriod">Semestre/Período Recomendado</Label>
                    <Input
                        id="basePeriod"
                        type="number"
                        {...register("basePeriod")}
                        disabled={isSubmitting}
                        className="p-5 rounded-lg bg-background"
                    />
                    {errors.basePeriod && <p className="text-sm text-red-600">{errors.basePeriod.message}</p>}
                </div>

                <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="workload">Carga Horária (h)</Label>
                    <Input
                        id="workload"
                        type="number"
                        {...register("workload")}
                        disabled={isSubmitting}
                        className="p-5 rounded-lg bg-background sm:w-72"
                    />
                    {errors.workload && <p className="text-sm text-red-600">{errors.workload.message}</p>}
                </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end pt-4 border-t">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={isSubmitting}
                >
                    Cancelar
                </Button>
                <Button className="flex items-center gap-2" type="submit" disabled={!canSubmit}>
                    {isSubmitting && <IconLoader2 className="size-5 animate-spin" />}
                    {isSubmitting ? "Salvando..." : "Salvar Alterações"}
                </Button>
            </div>
        </form>
    );
}
