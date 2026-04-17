"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { deleteCampusAction, editCampusAction } from "../actions";
import { createCampusSchema, type CreateCampusInput } from "../../../novo/schema";
import { IconAlertTriangle, IconLoader2 } from "@tabler/icons-react";
import Image from "next/image";
import imgGibbyDuvida from "@/assets/images/logo-gibby-duvida.svg";
import { isRedirectError } from "@/lib/is-redirect-error";
import { Campus } from "@/generated/prisma/client";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface EditCampusFormProps {
    initialData: Campus;
}

export function EditCampusForm({ initialData }: EditCampusFormProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [isDeleting, setIsDeleting] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteConfirmationName, setDeleteConfirmationName] = useState("");
    const [deleteError, setDeleteError] = useState<string | null>(null);

    const form = useForm<CreateCampusInput>({
        resolver: zodResolver(createCampusSchema),
        mode: "onChange",
        defaultValues: {
            name: initialData.name,
            slug: initialData.slug,
            address: initialData.address || "",
        },
    });

    const {
        register,
        formState: { errors, isSubmitting, isDirty, isValid },
        setError,
        clearErrors,
        reset,
    } = form;

    const canSubmit = isValid && isDirty && !isSubmitting && !isDeleting;
    const canDelete = deleteConfirmationName === initialData.name && !isDeleting;

    useEffect(() => {
        clearErrors();
    }, [clearErrors, reset]);

    const onSubmit: SubmitHandler<CreateCampusInput> = async (data) => {
        clearErrors("root");

        try {
            const result = await editCampusAction(initialData.id, data);
            if (result?.success === false) {
                const params = new URLSearchParams(searchParams.toString());
                params.set("toast", "error");
                params.set("message", result.error || "Erro ao editar instituição");
                router.replace(`${pathname}?${params.toString()}`, { scroll: false });

                setError("root", {
                    type: "server",
                    message: result.error || "Erro ao editar instituição",
                });
                return;
            }
        } catch (error) {
            if (isRedirectError(error)) {
                throw error;
            }

            const params = new URLSearchParams(searchParams.toString());
            params.set("toast", "error");
            params.set("message", "Erro fatal ao editar instituição");
            router.replace(`${pathname}?${params.toString()}`, { scroll: false });

            setError("root", {
                type: "server",
                message: "Erro fatal ao editar instituição",
            });
        }
    };

    const handleDelete = async () => {
        setDeleteError(null);
        setIsDeleting(true);
        try {
            const result = await deleteCampusAction(initialData.id);
            if (result?.success === false) {
                const params = new URLSearchParams(searchParams.toString());
                params.set("toast", "error");
                params.set("message", result.error || "Erro ao excluir instituição");
                router.replace(`${pathname}?${params.toString()}`, { scroll: false });

                setDeleteError(result.error || "Erro ao excluir instituição");
            }
        } catch (error) {
            if (isRedirectError(error)) {
                throw error;
            }

            const params = new URLSearchParams(searchParams.toString());
            params.set("toast", "error");
            params.set("message", "Erro fatal ao excluir instituição");
            router.replace(`${pathname}?${params.toString()}`, { scroll: false });

            setDeleteError("Erro fatal ao excluir instituição");
        } finally {
            setIsDeleting(false);
            setIsDeleteModalOpen(false);
        }
    };

    return (
        <div className="space-y-12">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {errors.root?.message && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-900 text-sm">
                        {errors.root.message}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="name">Nome da Instituição *</Label>
                        <Input
                            id="name"
                            placeholder="Ex: Campus Central"
                            {...register("name")}
                            disabled={isSubmitting || isDeleting}
                            aria-invalid={errors.name ? "true" : "false"}
                            className="p-5 rounded-lg bg-background"
                        />
                        {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
                    </div>

                    <div className="space-y-2 md:col-span-1">
                        <Label htmlFor="slug">Slug</Label>
                        <Input
                            id="slug"
                            {...register("slug")}
                            disabled
                            className="p-5 rounded-lg bg-muted text-muted-foreground"
                        />
                        <p className="text-xs text-muted-foreground italic">O slug não pode ser alterado após a criação.</p>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="address">Endereço *</Label>
                        <Input
                            id="address"
                            placeholder="Ex: Av. Principal, 1000"
                            {...register("address")}
                            disabled={isSubmitting || isDeleting}
                            className="p-5 rounded-lg bg-background"
                        />
                        {errors.address && <p className="text-sm text-red-600">{errors.address.message}</p>}
                    </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end pt-4 border-t">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={isSubmitting || isDeleting}
                    >
                        Cancelar
                    </Button>
                    <Button className="flex items-center gap-2" type="submit" disabled={!canSubmit}>
                        {isSubmitting && <IconLoader2 className="size-5 animate-spin" />}
                        {isSubmitting ? "Salvando..." : "Salvar Alterações"}
                    </Button>
                </div>
            </form>

            <div className="border border-destructive/25 bg-destructive/5 rounded-2xl p-4 sm:p-5 space-y-4">
                <div>
                    <div className="flex flex-row items-center gap-2">
                        <IconAlertTriangle className="size-5 text-red-600" />
                        <h3 className="text-xl font-semibold text-destructive">Zona de Perigo</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                        Esta ação removerá a instituição <b>permanentemente</b> do sistema. Apenas instituições sem salas vinculadas podem ser excluídas.
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
                                Excluir Instituição
                            </Button>
                        </DialogTrigger>
                    </div>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Excluir Instituição</DialogTitle>
                            <DialogDescription>
                                Deseja realmente excluir esta instituição permanentemente?
                            </DialogDescription>
                        </DialogHeader>

                        <div className="flex flex-col items-center">
                            <Image className="w-32 h-32" src={imgGibbyDuvida} alt="Gibby Duvida" width={100} height={100} />
                            <span className="text-center mt-2"> Para confirmar, digite exatamente o nome da instituição: <br /><strong className="text-lg text-foreground">{initialData.name}</strong></span>
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
                                onClick={handleDelete}
                                className="flex items-center gap-2"
                                disabled={!canDelete}
                            >
                                {isDeleting && <IconLoader2 className="size-5 animate-spin" />}
                                {isDeleting ? "Excluindo..." : "Excluir Definitivamente"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
