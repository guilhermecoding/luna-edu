"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useForm, type SubmitHandler, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { createClassGroupAction } from "../actions";
import { classGroupSchema, type ClassGroupInput } from "../../schema";
import { IconLoader2, IconArrowsShuffle } from "@tabler/icons-react";
import { isRedirectError } from "@/lib/is-redirect-error";
import autoSlug from "@/lib/auto-slug";

interface CreateClassGroupFormProps {
    programSlug: string;
    periodSlug: string;
}

export function CreateClassGroupForm({ programSlug, periodSlug }: CreateClassGroupFormProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const form = useForm<ClassGroupInput>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(classGroupSchema) as any,
        mode: "onChange",
        defaultValues: {
            name: "",
            slug: "",
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

    const onSubmit: SubmitHandler<ClassGroupInput> = async (data) => {
        clearErrors("root");

        try {
            const result = await createClassGroupAction(programSlug, periodSlug, data);

            if (result?.success === false) {
                const params = new URLSearchParams(searchParams.toString());
                params.set("toast", "error");
                params.set("message", result.error || "Erro ao criar grupo");
                router.replace(`${pathname}?${params.toString()}`, { scroll: false });

                setError("root", {
                    type: "server",
                    message: result.error || "Erro ao criar grupo",
                });
                return;
            }
        } catch (error) {
            if (isRedirectError(error)) {
                throw error;
            }

            const params = new URLSearchParams(searchParams.toString());
            params.set("toast", "error");
            params.set("message", "Erro fatal ao criar grupo");
            router.replace(`${pathname}?${params.toString()}`, { scroll: false });

            setError("root", {
                type: "server",
                message: "Erro fatal ao criar grupo",
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
                    <Label htmlFor="name">Nome do Grupo *</Label>
                    <Input
                        id="name"
                        placeholder="Ex: 1º Ano A, 2ª Série B, Turma Manhã 01"
                        {...register("name")}
                        disabled={isSubmitting}
                        aria-invalid={errors.name ? "true" : "false"}
                        className="p-5 rounded-lg bg-background"
                    />
                    {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
                </div>

                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="slug">Código do Grupo *</Label>
                    <div className="flex gap-2">
                        <Input
                            id="slug"
                            placeholder="Ex: 1-ano-a"
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
                    <p className="text-[10px] text-muted-foreground italic">
                        Este código deve ser único e amigável (apenas letras, números e hífens).
                    </p>
                    {errors.slug && <p className="text-sm text-red-600">{errors.slug.message}</p>}
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
                    {isSubmitting ? "Criando..." : "Criar Grupo"}
                </Button>
            </div>
        </form>
    );
}
