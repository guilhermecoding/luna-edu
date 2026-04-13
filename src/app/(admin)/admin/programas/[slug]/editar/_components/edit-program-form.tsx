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
import { useRouter } from "next/navigation";
import { useForm, useWatch, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { useState } from "react";
import { useEffect } from "react";
import { deleteProgramAction, editProgramAction } from "../actions";
import { editProgramSchema } from "../schema";
import { IconAlertTriangle, IconLoader2 } from "@tabler/icons-react";
import Image from "next/image";
import imgGibbyDuvida from "@/assets/images/logo-gibby-duvida.svg";

type FormInput = z.input<typeof editProgramSchema>;
type FormOutput = z.output<typeof editProgramSchema>;

type EditProgramFormProps = {
    slug: string;
    name: string;
    description: string;
};

export function EditProgramForm({ slug, name, description }: EditProgramFormProps) {
    const router = useRouter();
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteConfirmationName, setDeleteConfirmationName] = useState("");
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

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
        reset,
        formState: { errors, isSubmitting, isValid },
        setError,
        clearErrors,
    } = form;

    const nameValue = useWatch({ control, name: "name" });
    const canSubmit = isValid && Boolean(nameValue?.trim()) && !isSubmitting;
    const canDelete = deleteConfirmationName === name && !isDeleting;

    useEffect(() => {
        clearErrors();

        return () => {
            reset({
                name,
                description,
            });
        };
    }, [clearErrors, description, name, reset]);

    const onSubmit: SubmitHandler<FormOutput> = async (data) => {
        clearErrors("root");

        try {
            const result = await editProgramAction(slug, data);
            if (result?.success === false) {
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

    const onDeleteProgram = async () => {
        setDeleteError(null);
        setIsDeleting(true);

        try {
            const result = await deleteProgramAction(slug, deleteConfirmationName);
            if (result?.success === false) {
                setDeleteError(result.error || "Erro ao apagar programa");
            }
        } catch {
            setDeleteError("Erro ao apagar programa");
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
                        Esta ação remove o programa <b>permanentemente</b>, bem como todos os dados associados (exceto os usuários), e não pode ser desfeita.
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
                                Apagar Programa
                            </Button>
                        </DialogTrigger>
                    </div>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Apagar Programa</DialogTitle>

                            <DialogDescription>
                                Deseja realmente apagar este programa?
                            </DialogDescription>
                        </DialogHeader>

                        <div className="flex flex-col items-center">
                            <Image className="w-32 h-32" src={imgGibbyDuvida} alt="Gibby Duvida" width={100} height={100} />
                            <span> Para confirmar, digite exatamente o nome do programa: <strong>{name}</strong></span>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirm-delete-program-name">Nome do programa</Label>
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
                                onClick={onDeleteProgram}
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