"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { IconLoader2 } from "@tabler/icons-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useForm, type SubmitHandler } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isRedirectError } from "@/lib/is-redirect-error";
import { Shift } from "@/generated/prisma/client";
import { shiftLabels } from "../../../schema";
import { updateClassGroupAction } from "../actions";
import { editClassGroupSchema, type EditClassGroupInput } from "../schema";

interface EditClassGroupFormProps {
    programSlug: string;
    periodSlug: string;
    classGroupSlug: string;
    defaultValues: {
        name: string;
        slug: string;
        degreeName: string;
        basePeriod: number;
        shift: Shift;
    };
}

export function EditClassGroupForm({
    programSlug,
    periodSlug,
    classGroupSlug,
    defaultValues,
}: EditClassGroupFormProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const form = useForm<EditClassGroupInput>({
        resolver: zodResolver(editClassGroupSchema),
        mode: "onChange",
        defaultValues: {
            name: defaultValues.name,
        },
    });

    const {
        register,
        formState: { errors, isSubmitting, isValid, isDirty },
        setError,
        clearErrors,
    } = form;

    const canSubmit = isValid && isDirty && !isSubmitting;

    const onSubmit: SubmitHandler<EditClassGroupInput> = async (data) => {
        clearErrors("root");
        try {
            const result = await updateClassGroupAction(programSlug, periodSlug, classGroupSlug, data);
            if (result?.success === false) {
                const params = new URLSearchParams(searchParams.toString());
                params.set("toast", "error");
                params.set("message", result.error || "Erro ao atualizar turma");
                router.replace(`${pathname}?${params.toString()}`, { scroll: false });
                setError("root", { type: "server", message: result.error || "Erro ao atualizar turma" });
            }
        } catch (error) {
            if (isRedirectError(error)) throw error;
            setError("root", { type: "server", message: "Erro fatal ao atualizar turma" });
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
                    <Label htmlFor="name">Nome da Turma *</Label>
                    <Input id="name" {...register("name")} disabled={isSubmitting} className="p-5 rounded-lg bg-background" />
                    {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="slug">Código</Label>
                    <Input id="slug" defaultValue={defaultValues.slug} readOnly disabled className="p-5 rounded-lg bg-muted text-muted-foreground uppercase" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="degree">Matriz</Label>
                    <Input id="degree" defaultValue={defaultValues.degreeName} readOnly disabled className="p-5 rounded-lg bg-muted text-muted-foreground" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="basePeriod">Série</Label>
                    <Input id="basePeriod" defaultValue={`${defaultValues.basePeriod}ª Série / ${defaultValues.basePeriod}º Ano`} readOnly disabled className="p-5 rounded-lg bg-muted text-muted-foreground" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="shift">Turno</Label>
                    <Input id="shift" defaultValue={shiftLabels[defaultValues.shift]} readOnly disabled className="p-5 rounded-lg bg-muted text-muted-foreground" />
                </div>
            </div>
            <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end pt-4 border-t items-center mt-6">
                <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
                    Cancelar
                </Button>
                <Button type="submit" disabled={!canSubmit} className="flex items-center gap-2">
                    {isSubmitting && <IconLoader2 className="size-5 animate-spin" />}
                    {isSubmitting ? "Salvando..." : "Salvar Alterações"}
                </Button>
            </div>
        </form>
    );
}
