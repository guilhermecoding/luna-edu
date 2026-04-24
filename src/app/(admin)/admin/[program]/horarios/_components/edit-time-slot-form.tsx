"use client";

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
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { deleteTimeSlotAction, editTimeSlotAction } from "../actions";
import { timeSlotSchema, type TimeSlotInput, type TimeSlotOutput } from "../schema";
import { IconAlertTriangle, IconLoader2 } from "@tabler/icons-react";
import Image from "next/image";
import imgGibbyDuvida from "@/assets/images/logo-gibby-duvida.svg";
import { isRedirectError } from "@/lib/is-redirect-error";
import { TimeSlot, Shift } from "@/generated/prisma/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Props = {
    programSlug: string;
    timeSlotId: string;
    initialData: TimeSlot;
};

export function EditTimeSlotForm({ programSlug, timeSlotId, initialData }: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteConfirmationName, setDeleteConfirmationName] = useState("");
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const form = useForm<TimeSlotInput, undefined, TimeSlotOutput>({
        resolver: zodResolver(timeSlotSchema),
        mode: "onChange",
        defaultValues: {
            name: initialData.name,
            startTime: initialData.startTime,
            endTime: initialData.endTime,
            shift: initialData.shift,
        },
    });

    const {
        register,
        setValue,
        getValues,
        trigger,
        formState: { errors, isSubmitting, isValid, isDirty },
        setError,
        clearErrors,
    } = form;

    const canSubmit = isValid && isDirty && !isSubmitting;
    const canDelete = deleteConfirmationName === initialData.name && !isDeleting;

    const handleFieldChange = () => {
        if (errors.root) clearErrors("root");
    };

    const onSubmit: SubmitHandler<TimeSlotOutput> = async (data: TimeSlotOutput) => {
        clearErrors("root");

        try {
            const result = await editTimeSlotAction(timeSlotId, programSlug, data);
            if (result?.success === false) {
                const params = new URLSearchParams(searchParams.toString());
                params.set("toast", "error");
                params.set("message", result.error || "Erro ao editar horário");
                router.replace(`${pathname}?${params.toString()}`, { scroll: false });

                setError("root", {
                    type: "server",
                    message: result.error || "Erro ao editar horário",
                });
                return;
            }
        } catch (error) {
            if (isRedirectError(error)) {
                throw error;
            }

            const params = new URLSearchParams(searchParams.toString());
            params.set("toast", "error");
            params.set("message", "Erro fatal ao editar horário");
            router.replace(`${pathname}?${params.toString()}`, { scroll: false });

            setError("root", {
                type: "server",
                message: "Erro fatal ao editar horário",
            });
        }
    };

    const onDeleteTimeSlot = async () => {
        setDeleteError(null);
        setIsDeleting(true);

        try {
            const result = await deleteTimeSlotAction(timeSlotId, programSlug);
            if (result?.success === false) {
                const params = new URLSearchParams(searchParams.toString());
                params.set("toast", "error");
                params.set("message", result.error || "Erro ao excluir horário");
                router.replace(`${pathname}?${params.toString()}`, { scroll: false });

                setDeleteError(result.error || "Erro ao excluir horário");
            }
        } catch (error) {
            if (isRedirectError(error)) {
                throw error;
            }

            setDeleteError("Erro crítico ao excluir horário.");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {errors.root?.message && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-900 text-sm">
                    {errors.root.message}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="name">Nome do Horário *</Label>
                    <Input
                        id="name"
                        placeholder="Ex: 1º Horário, Aula 1"
                        {...register("name")}
                        onChange={(e) => {
                            register("name").onChange(e);
                            handleFieldChange();
                        }}
                        disabled={isSubmitting}
                        aria-invalid={errors.name ? "true" : "false"}
                        className="p-5 rounded-lg bg-background"
                    />
                    {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="startTime">Início *</Label>
                    <Input
                        id="startTime"
                        type="time"
                        {...register("startTime", {
                            onChange: () => {
                                handleFieldChange();
                                if (getValues("endTime")) trigger("endTime");
                            },
                        })}
                        disabled={isSubmitting}
                        aria-invalid={errors.startTime ? "true" : "false"}
                        className="p-5 rounded-lg bg-background"
                    />
                    {errors.startTime && <p className="text-sm text-red-600">{errors.startTime.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="endTime">Término *</Label>
                    <Input
                        id="endTime"
                        type="time"
                        {...register("endTime", {
                            onChange: () => {
                                handleFieldChange();
                                if (getValues("startTime")) trigger("startTime");
                            },
                        })}
                        disabled={isSubmitting}
                        aria-invalid={errors.endTime ? "true" : "false"}
                        className="p-5 rounded-lg bg-background"
                    />
                    {errors.endTime && <p className="text-sm text-red-600">{errors.endTime.message}</p>}
                </div>

                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="shift">Turno *</Label>
                    <Select
                        defaultValue={initialData.shift}
                        onValueChange={(value) => {
                            setValue("shift", value as Shift, { shouldDirty: true, shouldValidate: true });
                            handleFieldChange();
                        }}
                        disabled={isSubmitting}
                    >
                        <SelectTrigger className="p-5 h-auto rounded-lg bg-background">
                            <SelectValue placeholder="Selecione o turno" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="MORNING">Matutino</SelectItem>
                            <SelectItem value="AFTERNOON">Vespertino</SelectItem>
                            <SelectItem value="NIGHT">Noturno</SelectItem>
                        </SelectContent>
                    </Select>
                    {errors.shift && <p className="text-sm text-red-600">{errors.shift.message}</p>}
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

            <div className="border border-destructive/25 bg-destructive/5 rounded-2xl p-4 sm:p-5 space-y-4">
                <div>
                    <div className="flex flex-row items-center gap-2">
                        <IconAlertTriangle className="size-5 text-red-600" />
                        <h3 className="text-xl font-semibold text-destructive">Zona de Perigo</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                        Esta ação removerá o horário <b>permanentemente</b>. Essa ação só pode ser concluída se não houver turmas utilizando este horário.
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
                    <div className="w-full flex justify-end">
                        <DialogTrigger asChild>
                            <Button type="button" variant="destructive" className="w-full sm:w-auto">
                                Excluir Horário
                            </Button>
                        </DialogTrigger>
                    </div>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Excluir Horário</DialogTitle>

                            <DialogDescription>
                                Deseja realmente excluir este horário permanentemente?
                            </DialogDescription>
                        </DialogHeader>

                        <div className="flex flex-col items-center">
                            <Image className="w-32 h-32" src={imgGibbyDuvida} alt="Gibby Duvida" width={100} height={100} />
                            <span className="text-center mt-2"> Para confirmar, digite exatamente o nome do horário: <br/><strong className="text-foreground">{initialData.name}</strong></span>
                        </div>

                        <div className="space-y-2 mt-2">
                            <Label htmlFor="confirm-delete-name">Confirme o nome</Label>
                            <Input
                                id="confirm-delete-name"
                                value={deleteConfirmationName}
                                onChange={(event) => setDeleteConfirmationName(event.target.value)}
                                placeholder="Digite o nome exato"
                                className="rounded-lg bg-background"
                                disabled={isDeleting}
                            />
                            {deleteError && <p className="text-sm text-red-600">{deleteError}</p>}
                        </div>

                        <DialogFooter className="mt-4">
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
                                onClick={onDeleteTimeSlot}
                                disabled={!canDelete}
                                className="flex items-center gap-2"
                            >
                                {isDeleting && <IconLoader2 className="size-5 animate-spin" />}
                                {isDeleting ? "Excluindo..." : "Excluir Definitivamente"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </form>
    );
}
