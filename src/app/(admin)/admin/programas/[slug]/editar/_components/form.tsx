"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useForm, useWatch, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { editProgramAction } from "../actions";
import { editProgramSchema } from "../schema";
import { IconLoader2 } from "@tabler/icons-react";

type FormInput = z.input<typeof editProgramSchema>;
type FormOutput = z.output<typeof editProgramSchema>;

type EditProgramFormProps = {
    slug: string;
    name: string;
    description: string;
};

export function EditProgramForm({ slug, name, description }: EditProgramFormProps) {
    const router = useRouter();

    const form = useForm<FormInput, undefined, FormOutput>({
        resolver: zodResolver(editProgramSchema),
        mode: "onChange",
        defaultValues: {
            name,
            description,
        },
    });

    const {
        register,
        control,
        formState: { errors, isSubmitting, isValid },
        setError,
        clearErrors,
    } = form;

    const nameValue = useWatch({ control, name: "name" });
    const canSubmit = isValid && Boolean(nameValue?.trim()) && !isSubmitting;

    const onSubmit: SubmitHandler<FormOutput> = async (data) => {
        clearErrors("root");

        try {
            const result = await editProgramAction(slug, data);
            if (result.success) {
                router.push("/admin/programas");
            } else {
                setError("root", {
                    type: "server",
                    message: result.error || "Erro ao atualizar programa",
                });
            }
        } catch {
            setError("root", {
                type: "server",
                message: "Erro ao atualizar programa",
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

            <div className="space-y-2 cursor-not-allowed!">
                <Label htmlFor="slug">Slug</Label>
                <Input
                    id="slug"
                    value={slug}
                    disabled
                    readOnly
                    className="w-full p-5 rounded-lg bg-muted text-muted-foreground"
                />
                <p className="text-xs text-muted-foreground">O slug não pode ser alterado.</p>
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
                <Button className="flex items-center gap-2" type="submit" disabled={!canSubmit}>
                    {isSubmitting && <IconLoader2 className="size-5 animate-spin" />}
                    {isSubmitting ? "Salvando..." : "Salvar Alterações"}
                </Button>
            </div>
        </form>
    );
}