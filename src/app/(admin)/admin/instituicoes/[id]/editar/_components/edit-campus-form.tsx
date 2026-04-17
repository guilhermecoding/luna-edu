"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { deleteCampusAction, editCampusAction } from "../actions";
import { createCampusSchema, type CreateCampusInput } from "../../../novo/schema";
import { IconAlertTriangleFilled, IconLoader2, IconTrash } from "@tabler/icons-react";
import { isRedirectError } from "@/lib/is-redirect-error";
import { Campus } from "@/generated/prisma/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

    const form = useForm<CreateCampusInput>({
        resolver: zodResolver(createCampusSchema),
        mode: "onChange",
        defaultValues: {
            name: initialData.name,
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
        setIsDeleting(true);
        try {
            const result = await deleteCampusAction(initialData.id);
            if (result?.success === false) {
                const params = new URLSearchParams(searchParams.toString());
                params.set("toast", "error");
                params.set("message", result.error || "Erro ao excluir instituição");
                router.replace(`${pathname}?${params.toString()}`, { scroll: false });

                setError("root", {
                    type: "server",
                    message: result.error || "Erro ao excluir instituição",
                });
            }
        } catch (error) {
            if (isRedirectError(error)) {
                throw error;
            }

            const params = new URLSearchParams(searchParams.toString());
            params.set("toast", "error");
            params.set("message", "Erro fatal ao excluir instituição");
            router.replace(`${pathname}?${params.toString()}`, { scroll: false });

            setError("root", {
                type: "server",
                message: "Erro fatal ao excluir instituição",
            });
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
                            className="p-5 h-[62px] rounded-lg bg-background"
                        />
                        {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="address">Endereço</Label>
                        <Input
                            id="address"
                            placeholder="Ex: Av. Principal, 1000"
                            {...register("address")}
                            disabled={isSubmitting || isDeleting}
                            className="p-5 h-[62px] rounded-lg bg-background"
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

            <Card className="border-red-500/20 bg-red-500/5 shadow-none rounded-3xl">
                <CardHeader>
                    <CardTitle className="text-red-600 flex items-center gap-2 text-xl">
                        <IconAlertTriangleFilled className="size-6" />
                        Zona de Perigo
                    </CardTitle>
                    <CardDescription className="text-red-600/80 text-base">
                        Ações irreversíveis para esta instituição. Proceda com cautela.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-xl border border-red-500/20 bg-red-500/10">
                        <div className="space-y-1">
                            <h4 className="font-semibold text-red-900 dark:text-red-400">Excluir Instituição</h4>
                            <p className="text-sm text-red-700 dark:text-red-400/80">
                                Esta ação removerá permanentemente a instituição do sistema.
                                Apenas instituições sem salas vinculadas podem ser excluídas.
                            </p>
                        </div>
                        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    variant="destructive"
                                    className="shrink-0 rounded-xl bg-red-600 hover:bg-red-700"
                                    disabled={isDeleting || isSubmitting}
                                >
                                    {isDeleting ? (
                                        <IconLoader2 className="size-5 animate-spin mr-2" />
                                    ) : (
                                        <IconTrash className="size-5 mr-2" />
                                    )}
                                    {isDeleting ? "Excluindo..." : "Excluir Instituição"}
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Você tem certeza absoluta?</DialogTitle>
                                    <DialogDescription>
                                        Esta ação não pode ser desfeita. Isso excluirá permanentemente
                                        a instituição <strong>{initialData.name}</strong> e removerá todos
                                        os dados associados a ela de nossos servidores.
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsDeleteModalOpen(false)}
                                        disabled={isDeleting}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={handleDelete}
                                        className="bg-red-600 hover:bg-red-700 text-white"
                                        disabled={isDeleting}
                                    >
                                        {isDeleting ? "Excluindo..." : "Sim, excluir instituição"}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
