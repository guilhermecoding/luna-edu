"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { updateRoomAction, deleteRoomAction } from "../actions";
import { roomSchema, type RoomInput } from "../schema";
import { IconLoader2, IconTrash } from "@tabler/icons-react";
import { isRedirectError } from "@/lib/is-redirect-error";
import { Room } from "@/generated/prisma/client";

interface EditRoomFormProps {
    campusSlug: string;
    initialData: Room;
}

export function EditRoomForm({ campusSlug, initialData }: EditRoomFormProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [isDeleting, setIsDeleting] = useState(false);

    const form = useForm<RoomInput>({
        resolver: zodResolver(roomSchema),
        mode: "onChange",
        defaultValues: {
            name: initialData.name,
            capacity: String(initialData.capacity),
            block: initialData.block || "",
            slug: initialData.slug,
        },
    });

    const {
        register,
        formState: { errors, isSubmitting, isValid, isDirty },
        setError,
        clearErrors,
        reset,
    } = form;

    const canSubmit = isValid && isDirty && !isSubmitting;

    useEffect(() => {
        clearErrors();
        reset(form.getValues());
    }, [clearErrors, reset, form]);

    const onSubmit: SubmitHandler<RoomInput> = async (data) => {
        clearErrors("root");

        try {
            const result = await updateRoomAction(campusSlug, initialData.id, data);

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
        if (!confirm("Tem certeza que deseja excluir esta sala?")) return;

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
                    <Label htmlFor="slug">Slug</Label>
                    <Input
                        id="slug"
                        {...register("slug")}
                        disabled
                        className="p-5 rounded-lg bg-muted text-muted-foreground flex-1"
                    />
                    <p className="text-xs text-muted-foreground italic">
                        O slug não pode ser alterado após a criação.
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

                <div className="space-y-2 md:col-span-1">
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
                    {isSubmitting ? "Salvando..." : "Salvar Alterações"}
                </Button>
            </div>
        </form>
    );
}
