"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useForm, useWatch, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { useEffect } from "react";
import { createDegreeAction } from "../actions";
import { createDegreeSchema } from "../schema";
import { IconLoader2 } from "@tabler/icons-react";
import autoSlug from "@/lib/auto-slug";

type FormInput = z.input<typeof createDegreeSchema>;
type FormOutput = z.output<typeof createDegreeSchema>;

type Props = {
    programSlug: string;
};

export function CreateDegreeForm({ programSlug }: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const form = useForm<FormInput, undefined, FormOutput>({
        resolver: zodResolver(createDegreeSchema),
        mode: "onChange",
        defaultValues: {
            name: "",
            slug: "",
            description: "",
            modality: "",
            level: "",
            totalHours: undefined,
        },
    });

    const {
        register,
        reset,
        formState: { errors, isSubmitting, isValid },
        setValue,
        setError,
        clearErrors,
        control,
    } = form;

    const nameValue = useWatch({ control, name: "name" });
    const slugValue = useWatch({ control, name: "slug" });
    const canSubmit = isValid && Boolean(nameValue?.trim()) && Boolean(slugValue?.trim()) && !isSubmitting;

    useEffect(() => {
        clearErrors();

        return () => {
            reset({
                name: "",
                slug: "",
                description: "",
                modality: "",
                level: "",
                totalHours: undefined,
            });
        };
    }, [clearErrors, reset]);

    const onSubmit: SubmitHandler<FormOutput> = async (data: FormOutput) => {
        clearErrors("root");

        try {
            const result = await createDegreeAction(programSlug, data);
            if (result?.success === false) {
                const params = new URLSearchParams(searchParams.toString());
                params.set("toast", "error");
                params.set("message", result.error || "Erro ao criar matriz");
                router.replace(`${pathname}?${params.toString()}`, { scroll: false });

                setError("root", {
                    type: "server",
                    message: result.error || "Erro ao criar matriz",
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
            params.set("message", "Erro ao criar matriz curricular");
            router.replace(`${pathname}?${params.toString()}`, { scroll: false });

            setError("root", {
                type: "server",
                message: "Erro ao criar matriz curricular",
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
                    <Label htmlFor="name">Nome do Curso/Matriz *</Label>
                    <Input
                        id="name"
                        placeholder="Ex: Engenharia de Software"
                        {...register("name")}
                        disabled={isSubmitting}
                        aria-invalid={errors.name ? "true" : "false"}
                        className="p-5 rounded-lg bg-background"
                    />
                    {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
                </div>

                <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="slug">Slug Organizacional *</Label>
                    <div className="flex gap-2">
                        <Input
                            id="slug"
                            placeholder="Ex: engenharia-software"
                            {...register("slug")}
                            disabled={isSubmitting}
                            aria-invalid={errors.slug ? "true" : "false"}
                            className="w-full sm:w-72 p-5 rounded-lg bg-background"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            className="text-sm p-4 bg-black text-white dark:bg-white dark:text-black mt-0.5"
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
                    <p className="text-xs text-muted-foreground">Utilizado nas URLs. Deve ser único e minúsculo.</p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="modality">Modalidade</Label>
                    <Input
                        id="modality"
                        placeholder="Ex: EAD, Presencial, Híbrido"
                        {...register("modality")}
                        disabled={isSubmitting}
                        className="p-5 rounded-lg bg-background"
                    />
                    {errors.modality && <p className="text-sm text-red-600">{errors.modality.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="level">Nível</Label>
                    <Input
                        id="level"
                        placeholder="Ex: Pós-graduação, Bacharelado"
                        {...register("level")}
                        disabled={isSubmitting}
                        className="p-5 rounded-lg bg-background"
                    />
                    {errors.level && <p className="text-sm text-red-600">{errors.level.message}</p>}
                </div>

                <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="totalHours">Carga Horária Total (h)</Label>
                    <Input
                        id="totalHours"
                        type="number"
                        placeholder="Ex: 3200"
                        {...register("totalHours")}
                        disabled={isSubmitting}
                        className="p-5 rounded-lg bg-background sm:w-72"
                    />
                    {errors.totalHours && <p className="text-sm text-red-600">{errors.totalHours.message}</p>}
                </div>

                <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="description">Descrição Acadêmica</Label>
                    <textarea
                        id="description"
                        placeholder="Descreva as competências deste curso/matriz curricular..."
                        {...register("description")}
                        disabled={isSubmitting}
                        className="w-full p-5 border border-input bg-background rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        rows={4}
                    />
                    {errors.description && <p className="text-sm text-red-600">{errors.description.message}</p>}
                </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end pt-4">
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
                    {isSubmitting ? "Criando..." : "Criar Matriz Curricular"}
                </Button>
            </div>
        </form>
    );
}
