"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { createSubjectAction } from "../actions";
import { createSubjectSchema } from "../schema";
import { IconLoader2 } from "@tabler/icons-react";
import { isRedirectError } from "@/lib/is-redirect-error";

type FormInput = z.input<typeof createSubjectSchema>;
type FormOutput = z.output<typeof createSubjectSchema>;

type Props = {
    programSlug: string;
    degreeSlug: string;
};

export function CreateSubjectForm({ programSlug, degreeSlug }: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [isBasePeriodAssignable, setIsBasePeriodAssignable] = useState(true);

    const form = useForm<FormInput, undefined, FormOutput>({
        resolver: zodResolver(createSubjectSchema),
        mode: "onChange",
        defaultValues: {
            name: "",
            code: "",
            workload: undefined,
            basePeriod: undefined,
        },
    });

    const {
        register,
        reset,
        formState: { errors, isSubmitting, isValid },
        setError,
        clearErrors,
    } = form;

    const canSubmit = isValid && !isSubmitting;

    useEffect(() => {
        clearErrors();

        return () => {
            reset({
                name: "",
                code: "",
                workload: undefined,
                basePeriod: undefined,
            });
        };
    }, [clearErrors, reset]);

    const onSubmit: SubmitHandler<FormOutput> = async (data: FormOutput) => {
        clearErrors("root");

        try {
            const result = await createSubjectAction(programSlug, degreeSlug, data);
            if (result?.success === false) {
                const params = new URLSearchParams(searchParams.toString());
                params.set("toast", "error");
                params.set("message", result.error || "Erro ao criar disciplina");
                router.replace(`${pathname}?${params.toString()}`, { scroll: false });

                setError("root", {
                    type: "server",
                    message: result.error || "Erro ao criar disciplina",
                });
                return;
            }
        } catch (error) {
            if (isRedirectError(error)) {
                throw error;
            }

            const params = new URLSearchParams(searchParams.toString());
            params.set("toast", "error");
            params.set("message", "Erro fatal ao criar disciplina");
            router.replace(`${pathname}?${params.toString()}`, { scroll: false });

            setError("root", {
                type: "server",
                message: "Erro fatal ao criar disciplina",
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="name">Nome da Disciplina *</Label>
                    <Input
                        id="name"
                        placeholder="Ex: Engenharia de Software I"
                        {...register("name")}
                        disabled={isSubmitting}
                        aria-invalid={errors.name ? "true" : "false"}
                        className="p-5 h-[62px] rounded-lg bg-background"
                    />
                    {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
                </div>

                <div className="space-y-2 md:col-span-1">
                    <Label htmlFor="code">Código Interno Único *</Label>
                    <Input
                        id="code"
                        placeholder="Ex: MAT0101"
                        {...register("code")}
                        disabled={isSubmitting}
                        aria-invalid={errors.code ? "true" : "false"}
                        className="p-5 h-[62px] rounded-lg bg-background font-mono text-sm"
                    />
                    {errors.code && <p className="text-sm text-red-600">{errors.code.message}</p>}
                    <p className="text-xs text-muted-foreground mt-1">Atenção: Este código não poderá ser alterado posteriormente.</p>
                </div>

                <div className="space-y-2 md:col-span-1">
                    <Label htmlFor="workload">Carga Horária (h)*</Label>
                    <Input
                        id="workload"
                        type="number"
                        placeholder="Ex: 80"
                        {...register("workload")}
                        disabled={isSubmitting}
                        className="p-5 h-[62px] rounded-lg bg-background"
                    />
                    {errors.workload && <p className="text-sm text-red-600">{errors.workload.message}</p>}
                </div>

                <div className="space-y-2 md:col-span-1">
                    <Label>Semestre/Período Recomendado*</Label>
                    <Select
                        value={isBasePeriodAssignable ? "assignable" : "not_assignable"}
                        onValueChange={(value) => {
                            const assignable = value === "assignable";
                            setIsBasePeriodAssignable(assignable);
                            if (!assignable) {
                                form.setValue("basePeriod", undefined, { shouldValidate: true, shouldDirty: true });
                            }
                        }}
                    >
                        <SelectTrigger className="w-full bg-background p-5 h-[62px]">
                            <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="assignable">Atribuível</SelectItem>
                            <SelectItem value="not_assignable">Não atribuível</SelectItem>
                        </SelectContent>
                    </Select>

                    {isBasePeriodAssignable && (
                        <div className="pt-2 relative">
                            <Input
                                id="basePeriod"
                                type="number"
                                placeholder="Ex: 1"
                                {...register("basePeriod")}
                                disabled={isSubmitting}
                                className="p-5 h-[62px] rounded-lg bg-background"
                            />
                            {errors.basePeriod && <p className="text-sm text-red-600 mt-1">{errors.basePeriod.message}</p>}
                        </div>
                    )}
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
                    {isSubmitting ? "Criando..." : "Adicionar Disciplina"}
                </Button>
            </div>
        </form>
    );
}
