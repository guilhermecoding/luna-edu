"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useForm, useWatch, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { createProgramAction } from "../action";
import { createProgramSchema } from "../schema";

type FormInput = z.input<typeof createProgramSchema>;
type FormOutput = z.output<typeof createProgramSchema>;

export function CreateProgramForm() {
    const router = useRouter();

    const form = useForm<FormInput, undefined, FormOutput>({
        resolver: zodResolver(createProgramSchema),
        mode: "onChange",
        defaultValues: {
            name: "",
            slug: "",
            description: "",
        },
    });

    const {
        register,
        formState: { errors, isSubmitting },
        setValue,
        setError,
        clearErrors,
        control,
    } = form;

    const nameValue = useWatch({ control, name: "name" });

    const onSubmit: SubmitHandler<FormOutput> = async (data: FormOutput) => {
        clearErrors("root");

        try {
            const result = await createProgramAction(data);
            if (result.success) {
                router.push("/admin/programas");
                router.refresh();
            } else {
                setError("root", {
                    type: "server",
                    message: result.error || "Erro ao criar programa",
                });
            }
        } catch {
            setError("root", {
                type: "server",
                message: "Erro ao criar programa",
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

            <div className="space-y-2">
                <Label htmlFor="name">Nome do Programa *</Label>
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

            <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <div className="flex gap-2">
                    <Input
                        id="slug"
                        placeholder="Ex: engenharia-software"
                        {...register("slug")}
                        disabled={isSubmitting}
                        aria-invalid={errors.slug ? "true" : "false"}
                        className="w-72 p-5 rounded-lg bg-background"
                    />
                    <Button
                        type="button"
                        variant="outline"
                        className="text-sm p-4 bg-black text-white dark:bg-white dark:text-black mt-0.5"
                        onClick={() => {
                            const newSlug = autoSlug(nameValue);
                            if (newSlug) {
                                setValue("slug", newSlug);
                            }
                        }}
                        disabled={isSubmitting || !nameValue}
                    >
                        Auto
                    </Button>
                </div>
                {errors.slug && <p className="text-sm text-red-600">{errors.slug.message}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <textarea
                    id="description"
                    placeholder="Descrição do programa (opcional)"
                    {...register("description")}
                    disabled={isSubmitting}
                    className="w-full p-5 border border-input bg-background rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    rows={4}
                />
                {errors.description && <p className="text-sm text-red-600">{errors.description.message}</p>}
            </div>

            <div className="flex gap-3 justify-end pt-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={isSubmitting}
                >
                    Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Criando..." : "Criar Programa"}
                </Button>
            </div>
        </form>
    );
}

function autoSlug(name: string) {
    return name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\w\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
}
