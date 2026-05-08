"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useForm, type SubmitHandler, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { createSubPeriodAction } from "../actions";
import { subPeriodSchema, type SubPeriodInput } from "../../schema";
import { IconLoader2, IconArrowsShuffle } from "@tabler/icons-react";
import autoSlug from "@/lib/auto-slug";

interface CreateSubPeriodFormProps {
    programSlug: string;
    periodSlug: string;
}

export function CreateSubPeriodForm({ programSlug, periodSlug }: CreateSubPeriodFormProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const form = useForm<SubPeriodInput>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(subPeriodSchema) as any,
        mode: "onChange",
        defaultValues: {
            name: "",
            slug: "",
            order: 1,
            startDate: "",
            endDate: "",
            weight: 1.0,
        },
    });

    const {
        register,
        formState: { errors, isSubmitting, isValid, isDirty },
        setValue,
        setError,
        clearErrors,
        reset,
    } = form;

    const nameValue = useWatch({ control: form.control, name: "name" });
    const slugValue = useWatch({ control: form.control, name: "slug" });
    const canSubmit = isValid && isDirty && !isSubmitting && Boolean(nameValue?.trim()) && Boolean(slugValue?.trim());

    useEffect(() => {
        clearErrors();
        reset();
    }, [clearErrors, reset]);

    const onSubmit: SubmitHandler<SubPeriodInput> = async (data) => {
        clearErrors("root");

        try {
            const result = await createSubPeriodAction(programSlug, periodSlug, data);

            if (result?.success === false) {
                const params = new URLSearchParams(searchParams.toString());
                params.set("toast", "error");
                params.set("message", result.error || "Erro ao criar etapa");
                router.replace(`${pathname}?${params.toString()}`, { scroll: false });

                setError("root", {
                    type: "server",
                    message: result.error || "Erro ao criar etapa",
                });
                return;
            }

            if (result?.success && result.redirectTo) {
                router.push(result.redirectTo);
                router.refresh();
                return;
            }
        } catch (error) {
            const params = new URLSearchParams(searchParams.toString());
            params.set("toast", "error");
            params.set("message", "Erro fatal ao criar etapa");
            router.replace(`${pathname}?${params.toString()}`, { scroll: false });

            setError("root", {
                type: "server",
                message: "Erro fatal ao criar etapa",
            });
        }
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {errors.root?.message && (
                <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg text-red-900 dark:text-red-200 text-sm">
                    {errors.root.message}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="name">Nome da Etapa *</Label>
                    <Input
                        id="name"
                        placeholder="Ex: 1º Bimestre, 2º Trimestre"
                        {...register("name")}
                        disabled={isSubmitting}
                        aria-invalid={errors.name ? "true" : "false"}
                        className="p-5 rounded-lg bg-background"
                    />
                    {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="slug">Código *</Label>
                    <div className="flex gap-2">
                        <Input
                            id="slug"
                            placeholder="Ex: 1-bimestre"
                            {...register("slug", {
                                onChange: (e) => {
                                    setValue("slug", e.target.value.toUpperCase(), {
                                        shouldValidate: true,
                                    });
                                },
                            })}
                            disabled={isSubmitting}
                            aria-invalid={errors.slug ? "true" : "false"}
                            className="p-5 rounded-lg bg-background flex-1 uppercase"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            className="px-4 py-1.5 bg-muted hover:bg-muted/80 text-foreground border-surface-border"
                            onClick={() => {
                                const newSlug = autoSlug(nameValue)?.toUpperCase();
                                if (newSlug) {
                                    setValue("slug", newSlug, {
                                        shouldDirty: true,
                                        shouldTouch: true,
                                        shouldValidate: true,
                                    });
                                }
                            }}
                            title="Gerar código a partir do nome"
                        >
                            <IconArrowsShuffle className="size-5" />
                        </Button>
                    </div>
                    {errors.slug && <p className="text-sm text-red-600">{errors.slug.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="order">Ordem *</Label>
                    <Input
                        id="order"
                        type="number"
                        min={1}
                        placeholder="1"
                        {...register("order")}
                        disabled={isSubmitting}
                        aria-invalid={errors.order ? "true" : "false"}
                        className="p-5 rounded-lg bg-background"
                    />
                    <p className="text-[10px] text-muted-foreground italic">
                        Define a sequência (ex: 1 = 1º Bim, 2 = 2º Bim).
                    </p>
                    {errors.order && <p className="text-sm text-red-600">{errors.order.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="startDate">Data de Início *</Label>
                    <Input
                        id="startDate"
                        type="date"
                        {...register("startDate")}
                        disabled={isSubmitting}
                        aria-invalid={errors.startDate ? "true" : "false"}
                        className="p-5 rounded-lg bg-background"
                    />
                    {errors.startDate && <p className="text-sm text-red-600">{errors.startDate.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="endDate">Data de Fim *</Label>
                    <Input
                        id="endDate"
                        type="date"
                        {...register("endDate")}
                        disabled={isSubmitting}
                        aria-invalid={errors.endDate ? "true" : "false"}
                        className="p-5 rounded-lg bg-background"
                    />
                    {errors.endDate && <p className="text-sm text-red-600">{errors.endDate.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="weight">Peso na Média Final</Label>
                    <Input
                        id="weight"
                        type="number"
                        step="0.1"
                        min={0.1}
                        placeholder="1.0"
                        {...register("weight")}
                        disabled={isSubmitting}
                        aria-invalid={errors.weight ? "true" : "false"}
                        className="p-5 rounded-lg bg-background"
                    />
                    <p className="text-[10px] text-muted-foreground italic">
                        Peso desta etapa no cálculo da média final (padrão: 1.0).
                    </p>
                    {errors.weight && <p className="text-sm text-red-600">{errors.weight.message}</p>}
                </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end pt-4 border-t items-center mt-6">
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
                    {isSubmitting ? "Criando..." : "Criar Etapa"}
                </Button>
            </div>
        </form>
    );
}
