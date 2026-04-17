"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useForm, type SubmitHandler, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { createRoomAction, updateRoomAction, deleteRoomAction } from "../actions";
import { roomSchema, type RoomInput } from "../schema";
import { IconLoader2, IconTrash } from "@tabler/icons-react";
import { isRedirectError } from "@/lib/is-redirect-error";
import autoSlug from "@/lib/auto-slug";
import { Room } from "@/generated/prisma/client";

interface RoomFormProps {
    campusSlug: string;
    initialData?: Room;
}

export function RoomForm({ campusSlug, initialData }: RoomFormProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const isEditing = !!initialData;

    const [isDeleting, setIsDeleting] = useState(false);

    const form = useForm<RoomInput>({
        resolver: zodResolver(roomSchema),
        mode: "onChange",
        defaultValues: {
            name: initialData?.name || "",
            capacity: initialData ? String(initialData.capacity) : "30",
            block: initialData?.block || "",
            slug: initialData?.slug || "",
        },
    });

    const {
        register,
        control,
        formState: { errors, isSubmitting, isValid, isDirty },
        setValue,
        setError,
        clearErrors,
        reset,
    } = form;

    const nameValue = useWatch({ control, name: "name" });
    const slugValue = useWatch({ control, name: "slug" });
    
    // In edit mode, we don't care about slug dirtiness.
    const canSubmit = isEditing 
        ? isValid && isDirty && !isSubmitting && Boolean(nameValue?.trim())
        : isValid && isDirty && !isSubmitting && Boolean(nameValue?.trim()) && Boolean(slugValue?.trim());

    useEffect(() => {
        clearErrors();
        reset(form.getValues());
    }, [clearErrors, reset, form]);

    const onSubmit: SubmitHandler<RoomInput> = async (data) => {
        clearErrors("root");

        try {
            let result;
            if (isEditing) {
                result = await updateRoomAction(campusSlug, initialData.id, data);
            } else {
                result = await createRoomAction(campusSlug, data);
            }

            if (result?.success === false) {
                const params = new URLSearchParams(searchParams.toString());
                params.set("toast", "error");
                params.set("message", result.error || "Erro ao salvar sala");
                router.replace(`${pathname}?${params.toString()}`, { scroll: false });

                setError("root", {
                    type: "server",
                    message: result.error || "Erro ao salvar sala",
                });
                return;
            }
        } catch (error) {
            if (isRedirectError(error)) {
                throw error;
            }

            const params = new URLSearchParams(searchParams.toString());
            params.set("toast", "error");
            params.set("message", "Erro fatal ao salvar sala");
            router.replace(`${pathname}?${params.toString()}`, { scroll: false });

            setError("root", {
                type: "server",
                message: "Erro fatal ao salvar sala",
            });
        }
    };

    const handleDelete = async () => {
        if (!initialData || !confirm("Tem certeza que deseja excluir esta sala?")) return;

        setIsDeleting(true);
        try {
            const result = await deleteRoomAction(campusSlug, initialData.id);
            if (result?.success === false) {
                const params = new URLSearchParams(searchParams.toString());
                params.set("toast", "error");
                params.set("message", result.error || "Erro ao excluir sala");
                router.replace(`${pathname}?${params.toString()}`, { scroll: false });

                setError("root", {
                    type: "server",
                    message: result.error || "Erro ao excluir sala",
                });
            }
        } catch (error) {
            if (isRedirectError(error)) throw error;
            setError("root", {
                type: "server",
                message: "Erro fatal ao excluir sala",
            });
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
                    <Label htmlFor="name">Nome da Sala / Laboratório *</Label>
                    <Input
                        id="name"
                        placeholder="Ex: Sala 101, Laboratório de Informática"
                        {...register("name")}
                        disabled={isSubmitting || isDeleting}
                        aria-invalid={errors.name ? "true" : "false"}
                        className="p-5 rounded-lg bg-background"
                    />
                    {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
                </div>

                <div className="space-y-2 md:col-span-1">
                    <Label htmlFor="slug">Slug *</Label>
                    <div className="flex gap-2">
                        <Input
                            id="slug"
                            placeholder="Ex: sala-101"
                            {...register("slug")}
                            disabled={isSubmitting || isEditing || isDeleting}
                            aria-invalid={errors.slug ? "true" : "false"}
                            className="p-5 rounded-lg bg-background flex-1"
                        />
                        {!isEditing && (
                            <Button
                                type="button"
                                variant="outline"
                                className="text-sm p-4 bg-black text-white dark:bg-white dark:text-black mt-0.5"
                                onClick={() => {
                                    const newSlug = autoSlug(nameValue);
                                    if (newSlug) {
                                        setValue("slug", newSlug, {
                                            shouldDirty: true,
                                            shouldTouch: true,
                                            shouldValidate: true,
                                        });
                                    }
                                }}
                                disabled={isSubmitting || isDeleting || !nameValue}
                            >
                                Auto
                            </Button>
                        )}
                    </div>
                    {errors.slug && <p className="text-sm text-red-600">{errors.slug.message}</p>}
                    <p className="text-xs text-muted-foreground italic">
                        {isEditing ? "O slug não pode ser alterado após a criação." : "O slug será usado na URL e não poderá ser alterado depois."}
                    </p>
                </div>

                <div className="space-y-2 md:col-span-1">
                    <Label htmlFor="capacity">Capacidade *</Label>
                    <Input
                        id="capacity"
                        placeholder="Ex: 30"
                        {...register("capacity")}
                        disabled={isSubmitting || isDeleting}
                        aria-invalid={errors.capacity ? "true" : "false"}
                        className="p-5 rounded-lg bg-background"
                    />
                    {errors.capacity && <p className="text-sm text-red-600">{errors.capacity.message}</p>}
                </div>

                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="block">Bloco / Prédio</Label>
                    <Input
                        id="block"
                        placeholder="Ex: Bloco A"
                        {...register("block")}
                        disabled={isSubmitting || isDeleting}
                        className="p-5 rounded-lg bg-background"
                    />
                    {errors.block && <p className="text-sm text-red-600">{errors.block.message}</p>}
                </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end pt-4 border-t items-center mt-6">
                {isEditing && (
                    <div className="mr-auto">
                        <Button
                            type="button"
                            variant="ghost"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={handleDelete}
                            disabled={isSubmitting || isDeleting}
                        >
                            {isDeleting ? <IconLoader2 className="size-5 animate-spin mr-2" /> : <IconTrash className="size-5 mr-2" />}
                            Excluir Sala
                        </Button>
                    </div>
                )}
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={isSubmitting || isDeleting}
                >
                    Cancelar
                </Button>
                <Button className="flex items-center gap-2" type="submit" disabled={!canSubmit || isDeleting}>
                    {isSubmitting && <IconLoader2 className="size-5 animate-spin" />}
                    {isSubmitting ? "Salvando..." : (isEditing ? "Salvar Alterações" : "Criar Sala")}
                </Button>
            </div>
        </form>
    );
}
