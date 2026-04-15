"use client";

import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm, useWatch, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconAlertTriangle, IconLoader2 } from "@tabler/icons-react";
import z from "zod";
import imgGibbyDuvida from "@/assets/images/logo-gibby-duvida.svg";
import { isRedirectError } from "@/lib/is-redirect-error";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deletePeriodAction, editPeriodAction } from "../actions";
import { editPeriodSchema } from "../schema";

type FormInput = z.input<typeof editPeriodSchema>;
type FormOutput = z.output<typeof editPeriodSchema>;

type EditPeriodFormProps = {
    programSlug: string;
    periodSlug: string;
    name: string;
    startDate: Date;
    endDate: Date;
};

export function EditPeriodForm({
    programSlug,
    periodSlug,
    name,
    startDate,
    endDate,
}: EditPeriodFormProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteConfirmationName, setDeleteConfirmationName] = useState("");
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const form = useForm<FormInput, undefined, FormOutput>({
        resolver: zodResolver(editPeriodSchema),
        mode: "onChange",
        defaultValues: {
            name,
            startDate,
            endDate,
        },
    });

    const {
        register,
        reset,
        setError,
        clearErrors,
        control,
        formState: { errors, isSubmitting, isValid },
    } = form;

    const nameValue = useWatch({ control, name: "name" });
    const startDateValue = useWatch({ control, name: "startDate" });
    const endDateValue = useWatch({ control, name: "endDate" });
    const canSubmit =
        isValid &&
        Boolean(nameValue?.trim()) &&
        Boolean(startDateValue) &&
        Boolean(endDateValue) &&
        !isSubmitting;
    const canDelete = deleteConfirmationName === name && !isDeleting;

    useEffect(() => {
        clearErrors();

        return () => {
            reset({
                name,
                startDate,
                endDate,
            });
        };
    }, [clearErrors, endDate, name, reset, startDate]);

    const onSubmit: SubmitHandler<FormOutput> = async (data) => {
        clearErrors("root");

        try {
            const result = await editPeriodAction(programSlug, periodSlug, data);
            if (result?.success === false) {
                const params = new URLSearchParams(searchParams.toString());
                params.set("toast", "error");
                params.set("message", result.error || "Erro ao atualizar período");
                router.replace(`${pathname}?${params.toString()}`, { scroll: false });

                setError("root", {
                    type: "server",
                    message: result.error || "Erro ao atualizar período",
                });

                return;
            }
        } catch (error) {
            if (isRedirectError(error)) {
                throw error;
            }

            const params = new URLSearchParams(searchParams.toString());
            params.set("toast", "error");
            params.set("message", "Erro ao atualizar período");
            router.replace(`${pathname}?${params.toString()}`, { scroll: false });

            setError("root", {
                type: "server",
                message: "Erro ao atualizar período",
            });
        }
    };

    const onDeletePeriod = async () => {
        setDeleteError(null);
        setIsDeleting(true);

        try {
            const result = await deletePeriodAction(programSlug, periodSlug, deleteConfirmationName);
            if (result?.success === false) {
                const params = new URLSearchParams(searchParams.toString());
                params.set("toast", "error");
                params.set("message", result.error || "Erro ao apagar período");
                router.replace(`${pathname}?${params.toString()}`, { scroll: false });

                setDeleteError(result.error || "Erro ao apagar período");
            }
        } catch (error) {
            if (isRedirectError(error)) {
                throw error;
            }

            const params = new URLSearchParams(searchParams.toString());
            params.set("toast", "error");
            params.set("message", "Erro ao apagar período");
            router.replace(`${pathname}?${params.toString()}`, { scroll: false });

            setDeleteError("Erro ao apagar período");
        } finally {
            setIsDeleting(false);
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

            <div className="space-y-2 cursor-not-allowed!">
                <Label htmlFor="slug">Slug</Label>
                <Input
                    id="slug"
                    value={periodSlug}
                    disabled
                    readOnly
                    className="w-full rounded-lg bg-muted p-5 text-muted-foreground"
                />
                <p className="text-xs text-muted-foreground">O slug não pode ser alterado.</p>
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
                    {isSubmitting ? "Salvando..." : "Salvar Alterações"}
                </Button>
            </div>

            <div className="space-y-4 rounded-2xl border border-destructive/25 bg-destructive/5 p-4 sm:p-5">
                <div>
                    <div className="flex flex-row items-center gap-2">
                        <IconAlertTriangle className="size-5 text-red-600" />
                        <h3 className="text-xl font-semibold text-destructive">Zona de Perigo</h3>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Esta ação remove o período <b>permanentemente</b>, bem como todos os dados associados, e não pode ser desfeita.
                    </p>
                </div>

                <Dialog
                    open={isDeleteModalOpen}
                    onOpenChange={(open) => {
                        setIsDeleteModalOpen(open);
                        if (!open) {
                            setDeleteConfirmationName("");
                            setDeleteError(null);
                        }
                    }}
                >
                    <div className="flex w-full justify-end">
                        <DialogTrigger asChild>
                            <Button type="button" variant="destructive" className="w-full sm:w-auto">
                                Apagar Período
                            </Button>
                        </DialogTrigger>
                    </div>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Apagar Período</DialogTitle>

                            <DialogDescription>
                                Deseja realmente apagar este período?
                            </DialogDescription>
                        </DialogHeader>

                        <div className="flex flex-col items-center">
                            <Image className="h-32 w-32" src={imgGibbyDuvida} alt="Gibby Duvida" width={100} height={100} />
                            <span>
                                {" "}
                                Para confirmar, digite exatamente o nome do período: <strong>{name}</strong>
                            </span>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirm-delete-period-name">Nome do período</Label>
                            <Input
                                id="confirm-delete-period-name"
                                value={deleteConfirmationName}
                                onChange={(event) => setDeleteConfirmationName(event.target.value)}
                                placeholder="Digite o nome exato para confirmar"
                                className="rounded-lg"
                                disabled={isDeleting}
                            />
                            {deleteError && <p className="text-sm text-red-600">{deleteError}</p>}
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsDeleteModalOpen(false)}
                                disabled={isDeleting}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={onDeletePeriod}
                                disabled={!canDelete}
                                className="flex items-center gap-2"
                            >
                                {isDeleting && <IconLoader2 className="size-5 animate-spin" />}
                                {isDeleting ? "Apagando..." : "Apagar"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </form>
    );
}
