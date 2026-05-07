"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { IconAlertTriangle, IconLoader2 } from "@tabler/icons-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useState } from "react";
import Image from "next/image";
import imgGibbyDuvida from "@/assets/images/logo-gibby-duvida.svg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isRedirectError } from "@/lib/is-redirect-error";
import { Shift } from "@/generated/prisma/enums";
import { shiftLabels } from "../../../schema";
import { updateClassGroupAction, deleteClassGroupAction } from "../actions";
import { editClassGroupSchema, type EditClassGroupInput } from "../schema";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Controller } from "react-hook-form";

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
        groupLink: string;
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
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteConfirmationName, setDeleteConfirmationName] = useState("");
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const form = useForm<EditClassGroupInput>({
        resolver: zodResolver(editClassGroupSchema),
        mode: "onChange",
        defaultValues: {
            name: defaultValues.name,
            shift: defaultValues.shift,
            groupLink: defaultValues.groupLink,
        },
    });

    const {
        register,
        control,
        formState: { errors, isSubmitting, isValid },
        setError,
        clearErrors,
    } = form;

    const canSubmit = isValid && !isSubmitting;
    const canDelete = deleteConfirmationName === defaultValues.name && !isDeleting;

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

    const onDeleteClassGroup = async () => {
        setDeleteError(null);
        setIsDeleting(true);

        try {
            const result = await deleteClassGroupAction(programSlug, periodSlug, classGroupSlug, deleteConfirmationName);
            if (result?.success === false) {
                const params = new URLSearchParams(searchParams.toString());
                params.set("toast", "error");
                params.set("message", result.error || "Erro ao apagar turma");
                router.replace(`${pathname}?${params.toString()}`, { scroll: false });

                setDeleteError(result.error || "Erro ao apagar turma");
            }
        } catch (error) {
            if (isRedirectError(error)) {
                throw error;
            }

            const params = new URLSearchParams(searchParams.toString());
            params.set("toast", "error");
            params.set("message", "Erro ao apagar turma");
            router.replace(`${pathname}?${params.toString()}`, { scroll: false });

            setDeleteError("Erro ao apagar turma");
        } finally {
            setIsDeleting(false);
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
                <div className="space-y-2 cursor-not-allowed">
                    <Label htmlFor="slug">Código</Label>
                    <Input id="slug" defaultValue={defaultValues.slug} readOnly disabled className="p-5 rounded-lg bg-muted text-muted-foreground uppercase" />
                    <p className="text-[10px] text-muted-foreground px-1">Este campo não pode ser alterado.</p>
                </div>
                <div className="space-y-2 cursor-not-allowed">
                    <Label htmlFor="degree">Matriz</Label>
                    <Input id="degree" defaultValue={defaultValues.degreeName} readOnly disabled className="p-5 rounded-lg bg-muted text-muted-foreground" />
                    <p className="text-[10px] text-muted-foreground px-1">Este campo não pode ser alterado.</p>
                </div>
                <div className="space-y-2 cursor-not-allowed">
                    <Label htmlFor="basePeriod">Série</Label>
                    <Input id="basePeriod" defaultValue={`${defaultValues.basePeriod}ª Série / ${defaultValues.basePeriod}º Ano`} readOnly disabled className="p-5 rounded-lg bg-muted text-muted-foreground" />
                    <p className="text-[10px] text-muted-foreground px-1">Este campo não pode ser alterado.</p>
                </div>
                <div className="space-y-2 flex flex-col justify-end">
                    <Label htmlFor="shift">Turno *</Label>
                    <Controller
                        name="shift"
                        control={control}
                        render={({ field }) => (
                            <Select
                                onValueChange={field.onChange}
                                value={field.value}
                                disabled={isSubmitting}
                            >
                                <SelectTrigger className="w-full p-5 rounded-lg bg-background h-auto">
                                    <SelectValue placeholder="Selecione o turno" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(shiftLabels).map(([value, label]) => (
                                        <SelectItem key={value} value={value}>
                                            {label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.shift && <p className="text-sm text-red-600">{errors.shift.message}</p>}
                </div>
                
                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="groupLink">Link para grupo de comunicação</Label>
                    <Input 
                        id="groupLink" 
                        placeholder="Ex: https://chat.whatsapp.com/..."
                        {...register("groupLink")} 
                        disabled={isSubmitting} 
                        className="p-5 rounded-lg bg-background" 
                    />
                    {errors.groupLink && <p className="text-sm text-red-600">{errors.groupLink.message}</p>}
                </div>
            </div>
            <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end pt-4">
                <Button type="button" className="w-full sm:w-auto" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
                    Cancelar
                </Button>
                <Button type="submit" disabled={!canSubmit} className="flex items-center gap-2 w-full sm:w-auto">
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
                        Esta ação remove a turma <b>permanentemente</b>, bem como todas as disciplinas (oferecimentos) atreladas a ela. <b>Os alunos não serão excluídos</b>, apenas desvinculados destas disciplinas. Esta ação não pode ser desfeita.
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
                                Apagar Turma
                            </Button>
                        </DialogTrigger>
                    </div>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Apagar Turma</DialogTitle>

                            <DialogDescription>
                                Deseja realmente apagar esta turma e excluir as disciplinas associadas? Os alunos apenas serão desvinculados.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="flex flex-col items-center text-center">
                            <Image className="w-32 h-32" src={imgGibbyDuvida} alt="Gibby Duvida" width={100} height={100} />
                            <span> Para confirmar, digite exatamente o nome da turma: <br /> <strong>{defaultValues.name}</strong></span>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirm-delete-program-name">Nome da turma</Label>
                            <Input
                                id="confirm-delete-program-name"
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
                                onClick={onDeleteClassGroup}
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
