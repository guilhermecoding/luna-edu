"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { useEffect } from "react";
import { editDegreeAction } from "../actions";
import { createDegreeSchema } from "../../../novo/schema";
import { IconLoader2 } from "@tabler/icons-react";
import { isRedirectError } from "@/lib/is-redirect-error";
import { Degree } from "@/generated/prisma/client";

// Omitimos o programId na edição do form client pois não alteramos os vínculos base lá
const editDegreeSchema = createDegreeSchema.omit({ slug: true });
type FormInput = z.input<typeof editDegreeSchema>;
type FormOutput = z.output<typeof editDegreeSchema>;

type Props = {
    programSlug: string;
    degreeId: string;
    degreeSlug: string;
    initialData: Degree;
};

export function EditDegreeForm({ programSlug, degreeId, degreeSlug, initialData }: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const form = useForm<FormInput, undefined, FormOutput>({
        resolver: zodResolver(editDegreeSchema),
        mode: "onChange",
        defaultValues: {
            name: initialData.name,
            description: initialData.description || "",
            modality: initialData.modality || "",
            level: initialData.level || "",
            totalHours: initialData.totalHours || undefined,
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
            const result = await editDegreeAction(degreeId, programSlug, degreeSlug, data);
            if (result?.success === false) {
                const params = new URLSearchParams(searchParams.toString());
                params.set("toast", "error");
                params.set("message", result.error || "Erro ao editar matriz");
                router.replace(`${pathname}?${params.toString()}`, { scroll: false });

                setError("root", {
                    type: "server",
                    message: result.error || "Erro ao editar matriz",
                });
                return;
            }
        } catch (error) {
            if (isRedirectError(error)) {
                throw error;
            }

            const params = new URLSearchParams(searchParams.toString());
            params.set("toast", "error");
            params.set("message", "Erro fatal ao editar matriz");
            router.replace(`${pathname}?${params.toString()}`, { scroll: false });

            setError("root", {
                type: "server",
                message: "Erro fatal ao editar matriz",
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
                        {...register("name")}
                        disabled={isSubmitting}
                        aria-invalid={errors.name ? "true" : "false"}
                        className="p-5 rounded-lg bg-background"
                    />
                    {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="modality">Modalidade</Label>
                    <Input
                        id="modality"
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
                        {...register("totalHours")}
                        disabled={isSubmitting}
                        className="p-5 rounded-lg bg-background sm:w-72"
                    />
                    {errors.totalHours && <p className="text-sm text-red-600">{errors.totalHours.message}</p>}
                </div>

                <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="description">Descrição</Label>
                    <textarea
                        id="description"
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
                    {isSubmitting ? "Salvando..." : "Salvar Alterações"}
                </Button>
            </div>
        </form>
    );
}
