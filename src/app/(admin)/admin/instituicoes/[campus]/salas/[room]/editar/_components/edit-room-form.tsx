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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useForm, type SubmitHandler, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { updateRoomAction, deleteRoomAction } from "../actions";
import { roomUpdateSchema, type RoomUpdateInput, ROOM_TYPES, roomTypeLabels } from "../../../schema";
import { IconAlertTriangle, IconLoader2, IconTrash } from "@tabler/icons-react";
import Image from "next/image";
import imgGibbyDuvida from "@/assets/images/logo-gibby-duvida.svg";
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

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteConfirmationName, setDeleteConfirmationName] = useState("");
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const form = useForm<RoomUpdateInput>({
        resolver: zodResolver(roomUpdateSchema),
        mode: "onChange",
        defaultValues: {
            name: initialData.name,
            capacity: String(initialData.capacity),
            block: initialData.block || "",
            type: initialData.type,
        },
    });

    const {
        register,
        control,
        formState: { errors, isSubmitting, isValid, isDirty },
        setError,
        clearErrors,
        reset,
    } = form;

    const canSubmit = isValid && isDirty && !isSubmitting;
    const canDelete = deleteConfirmationName === initialData.name && !isDeleting;

    useEffect(() => {
        clearErrors();
        reset(form.getValues());
    }, [clearErrors, reset, form]);

    const onSubmit: SubmitHandler<RoomUpdateInput> = async (data) => {
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

    const onDeleteRoom = async () => {
        setDeleteError(null);
        setIsDeleting(true);

        try {
            const result = await deleteRoomAction(campusSlug, initialData.id);
            if (result?.success === false) {
                const params = new URLSearchParams(searchParams.toString());
                params.set("toast", "error");
                params.set("message", result.error || "Erro ao excluir sala");
                router.replace(`${pathname}?${params.toString()}`, { scroll: false });

                setDeleteError(result.error || "Erro ao excluir sala");
            }
        } catch (error) {
            if (isRedirectError(error)) throw error;
            setDeleteError("Erro fatal ao excluir sala");
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
                        defaultValue={initialData.slug}
                        readOnly
                        tabIndex={-1}
                        autoComplete="off"
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

                <div className="space-y-2 md:col-span-1">
                    <Label htmlFor="type">Tipo *</Label>
                    <Controller
                        control={control}
                        name="type"
                        render={({ field }) => (
                            <Select
                                value={field.value}
                                onValueChange={field.onChange}
                                disabled={isSubmitting || isDeleting}
                            >
                                <SelectTrigger
                                    id="type"
                                    className="p-5 rounded-lg bg-background"
                                    aria-invalid={errors.type ? "true" : "false"}
                                >
                                    <SelectValue placeholder="Selecione o tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    {ROOM_TYPES.map((type) => (
                                        <SelectItem key={type} value={type}>
                                            {roomTypeLabels[type]}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.type && <p className="text-sm text-red-600">{errors.type.message}</p>}
                </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end pt-4 border-t items-center mt-6">
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

            <div className="border border-destructive/25 bg-destructive/5 rounded-2xl p-4 sm:p-5 space-y-4 mt-12">
                <div>
                    <div className="flex flex-row items-center gap-2">
                        <IconAlertTriangle className="size-5 text-red-600" />
                        <h3 className="text-xl font-semibold text-destructive">Zona de Perigo</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                        Esta ação removerá a sala <b>permanentemente</b>. Apenas salas sem reservas ou turmas vinculadas podem ser excluídas.
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
                                <IconTrash className="size-5 mr-2" />
                                Excluir Sala
                            </Button>
                        </DialogTrigger>
                    </div>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Excluir Sala</DialogTitle>
                            <DialogDescription>
                                Deseja realmente excluir esta sala permanentemente?
                            </DialogDescription>
                        </DialogHeader>

                        <div className="flex flex-col items-center">
                            <Image className="w-32 h-32" src={imgGibbyDuvida} alt="Gibby Duvida" width={100} height={100} />
                            <span className="text-center mt-2"> Para confirmar, digite exatamente o nome da sala: <br /><strong className="text-foreground">{initialData.name}</strong></span>
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
                                onClick={onDeleteRoom}
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
