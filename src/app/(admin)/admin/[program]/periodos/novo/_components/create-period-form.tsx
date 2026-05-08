"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { IconLoader2 } from "@tabler/icons-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { Controller, useForm, useWatch, type SubmitHandler } from "react-hook-form";
import z from "zod";
import { createPeriodAction } from "../actions";
import { createPeriodSchema } from "../schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import autoSlug from "@/lib/auto-slug";

type FormInput = z.input<typeof createPeriodSchema>;
type FormOutput = z.output<typeof createPeriodSchema>;

type CreatePeriodFormProps = {
    programSlug: string;
};

export function CreatePeriodForm({ programSlug }: CreatePeriodFormProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const form = useForm<FormInput, undefined, FormOutput>({
        resolver: zodResolver(createPeriodSchema),
        mode: "onChange",
        defaultValues: {
            name: "",
            slug: "",
            startDate: undefined,
            endDate: undefined,
        },
    });

    const {
        register,
        reset,
        setValue,
        setError,
        clearErrors,
        control,
        formState: { errors, isSubmitting, isValid },
    } = form;

    const nameValue = useWatch({ control, name: "name" });
    const slugValue = useWatch({ control, name: "slug" });
    const startDateValue = useWatch({ control, name: "startDate" });
    const endDateValue = useWatch({ control, name: "endDate" });
    const canSubmit =
        isValid &&
        Boolean(nameValue?.trim()) &&
        Boolean(slugValue?.trim()) &&
        Boolean(startDateValue) &&
        Boolean(endDateValue) &&
        !isSubmitting;

    useEffect(() => {
        clearErrors();

        return () => {
            reset({
                name: "",
                slug: "",
                startDate: undefined,
                endDate: undefined,
            });
        };
    }, [clearErrors, reset]);

    const onSubmit: SubmitHandler<FormOutput> = async (data) => {
        clearErrors("root");

        try {
            const result = await createPeriodAction(programSlug, data);

            if (result?.success === false) {
                const params = new URLSearchParams(searchParams.toString());
                params.set("toast", "error");
                params.set("message", result.error || "Erro ao criar período");
                router.replace(`${pathname}?${params.toString()}`, { scroll: false });

                setError("root", {
                    type: "server",
                    message: result.error || "Erro ao criar período",
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
            params.set("message", "Erro ao criar período");
            router.replace(`${pathname}?${params.toString()}`, { scroll: false });

            setError("root", {
                type: "server",
                message: "Erro ao criar período",
            });
        }
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {errors.root?.message && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900">
                    {errors.root.message}
                </div>
            )}

            <div className="space-y-2">
                <Label htmlFor="name">Nome do Período *</Label>
                <Input
                    id="name"
                    placeholder="Ex: 2026.1"
                    {...register("name")}
                    disabled={isSubmitting}
                    aria-invalid={errors.name ? "true" : "false"}
                    className="rounded-lg bg-background p-5"
                />
                {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <div className="flex gap-2">
                    <Input
                        id="slug"
                        placeholder="Ex: 2026-1"
                        {...register("slug")}
                        disabled={isSubmitting}
                        aria-invalid={errors.slug ? "true" : "false"}
                        className="w-72 rounded-lg bg-background p-5"
                    />
                    <Button
                        type="button"
                        variant="outline"
                        className="mt-0.5 bg-black p-4 text-sm text-white dark:bg-white dark:text-black"
                        onClick={() => {
                            const newSlug = autoSlug(nameValue);
                            if (newSlug) {
                                setValue("slug", newSlug, {
                                    shouldDirty: true,
                                    shouldTouch: true,
                                    shouldValidate: true,
                                });
                            }
                        }}
                        disabled={isSubmitting || !nameValue}
                    >
                        Auto
                    </Button>
                </div>
                {errors.slug && <p className="text-sm text-red-600">{errors.slug.message}</p>}
                <p className="text-xs text-muted-foreground">O slug não poderá ser alterado após a criação do período.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <Controller
                    control={control}
                    name="startDate"
                    render={({ field }) => (
                        <div className="space-y-2">
                            <Label>Data de Início *</Label>
                            <Input
                                type="date"
                                value={field.value instanceof Date ? field.value.toISOString().slice(0, 10) : ""}
                                onClick={(event) => {
                                    try {
                                        event.currentTarget.showPicker?.();
                                    } catch {
                                        // Em navegadores sem suporte/gesto válido, mantém comportamento nativo padrão.
                                    }
                                }}
                                onChange={(event) => {
                                    const nextValue = event.target.value;
                                    field.onChange(nextValue ? new Date(`${nextValue}T00:00:00`) : undefined);
                                }}
                                disabled={isSubmitting}
                                className="h-10 w-full rounded-xl bg-background px-3 text-sm sm:w-53"
                            />
                            {errors.startDate && <p className="text-sm text-red-600">{errors.startDate.message}</p>}
                        </div>
                    )}
                />

                <Controller
                    control={control}
                    name="endDate"
                    render={({ field }) => (
                        <div className="space-y-2">
                            <Label>Data de Término *</Label>
                            <Input
                                type="date"
                                value={field.value instanceof Date ? field.value.toISOString().slice(0, 10) : ""}
                                onClick={(event) => {
                                    try {
                                        event.currentTarget.showPicker?.();
                                    } catch {
                                        // Em navegadores sem suporte/gesto válido, mantém comportamento nativo padrão.
                                    }
                                }}
                                onChange={(event) => {
                                    const nextValue = event.target.value;
                                    field.onChange(nextValue ? new Date(`${nextValue}T00:00:00`) : undefined);
                                }}
                                disabled={isSubmitting}
                                className="h-10 w-full rounded-xl bg-background px-3 text-sm sm:w-53"
                            />
                            {errors.endDate && <p className="text-sm text-red-600">{errors.endDate.message}</p>}
                        </div>
                    )}
                />
            </div>

            <div className="flex flex-col-reverse justify-end gap-3 pt-4 sm:flex-row">
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
                    {isSubmitting ? "Criando..." : "Criar Período"}
                </Button>
            </div>
        </form>
    );
}