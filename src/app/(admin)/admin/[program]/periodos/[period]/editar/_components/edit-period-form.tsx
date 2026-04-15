"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    deletePeriodAction,
    editPeriodAction,
} from "../actions";
import { editPeriodSchema } from "../schema";

type FormInput = z.input<typeof editPeriodSchema>;
type FormOutput = z.output<typeof editPeriodSchema>;

type EditPeriodFormProps = {
    programSlug: string;
    periodSlug: string;
    name: string;
    startDate: Date;
    endDate: Date;
    completedAt: Date | null;
};

type PeriodStatus = "active" | "completed";

export function EditPeriodForm({
    programSlug,
    periodSlug,
    name,
    startDate,
    endDate,
    completedAt,
}: EditPeriodFormProps) {
    const router = useRouter();
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteConfirmationName, setDeleteConfirmationName] = useState("");
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [pendingStatus, setPendingStatus] = useState<PeriodStatus | null>(null);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

    const form = useForm<FormInput, undefined, FormOutput>({
        resolver: zodResolver(editPeriodSchema),
        mode: "onChange",
        defaultValues: {
            name,
            startDate,
            endDate,
            status: completedAt ? "completed" : "active",
        },
    });

    const {
        register,
        setValue,
        setError,
        clearErrors,
        control,
        formState: { errors, isSubmitting, isValid },
    } = form;

    const nameValue = useWatch({ control, name: "name" });
    const startDateValue = useWatch({ control, name: "startDate" });
    const endDateValue = useWatch({ control, name: "endDate" });
    const statusValue = useWatch({ control, name: "status" });
    const canSubmit =
        isValid &&
        Boolean(nameValue?.trim()) &&
        Boolean(startDateValue) &&
        Boolean(endDateValue) &&
        Boolean(statusValue) &&
        !isSubmitting;
    const canDelete = deleteConfirmationName === name && !isDeleting;
    const statusToConfirm = pendingStatus ?? statusValue;
    const isConcludeAction = statusToConfirm === "completed";

    const onSubmit: SubmitHandler<FormOutput> = async (data) => {
        clearErrors("root");

        try {
            const result = await editPeriodAction(programSlug, periodSlug, data);
            if (result?.success === false) {
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
                setDeleteError(result.error || "Erro ao apagar período");
            }
        } catch (error) {
            if (isRedirectError(error)) {
                throw error;
            }

            setDeleteError("Erro ao apagar período");
        } finally {
            setIsDeleting(false);
        }
    };

    const onStatusChange = (nextStatus: string) => {
        if (nextStatus !== "active" && nextStatus !== "completed") {
            return;
        }

        if (nextStatus === statusValue) {
            return;
        }

        setPendingStatus(nextStatus);
        setIsStatusModalOpen(true);
    };

    const onConfirmStatusChange = () => {
        if (!pendingStatus) {
            setIsStatusModalOpen(false);
            return;
        }

        setValue("status", pendingStatus, {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
        });
        setPendingStatus(null);
        setIsStatusModalOpen(false);
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

            <div className="space-y-2">
                <Label htmlFor="status">Status do Período</Label>
                <Select
                    value={statusValue}
                    onValueChange={onStatusChange}
                    disabled={isSubmitting}
                >
                    <SelectTrigger id="status" className="h-10 w-full rounded-xl bg-background px-3 text-sm sm:w-53">
                        <SelectValue placeholder="Selecione um status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="active">Ativo</SelectItem>
                        <SelectItem value="completed">Concluído</SelectItem>
                    </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                    Controla o status do período, independentemente das datas de início e término. Períodos concluídos não são considerados ativos mesmo que a data atual esteja entre o início e término.
                </p>
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
                        Esta ação remove o período <b>permanentemente</b>, bem como todos os dados associados (exceto os usuários), e não pode ser desfeita.
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
                                Para confirmar, digite exatamente o nome do período:<br /> <strong>{name}</strong>
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

            <Dialog
                open={isStatusModalOpen}
                onOpenChange={(open) => {
                    setIsStatusModalOpen(open);
                    if (!open) {
                        setPendingStatus(null);
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{isConcludeAction ? "Concluir Período" : "Ativar Período"}</DialogTitle>

                        <DialogDescription>
                            {isConcludeAction
                                ? "Deseja realmente concluir este período?"
                                : "Deseja realmente ativar este período?"}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col items-center">
                        <Image className="h-32 w-32" src={imgGibbyDuvida} alt="Gibby Duvida" width={100} height={100} />
                        <span className="text-center">
                            {isConcludeAction
                                ? "Ao concluir, este período deixará de ser considerado ativo até que seja ativado novamente."
                                : "Ao ativar, este período voltará a ser considerado ativo após salvar as alterações."}
                        </span>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setIsStatusModalOpen(false);
                                setPendingStatus(null);
                            }}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="button"
                            variant="default"
                            onClick={onConfirmStatusChange}
                            className="flex items-center gap-2"
                        >
                            {isConcludeAction ? "Concluir" : "Ativar"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </form>
    );
}
