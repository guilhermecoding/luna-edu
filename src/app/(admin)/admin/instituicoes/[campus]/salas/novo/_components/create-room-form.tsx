"use client";

import { Button } from "@/components/ui/button";
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
import { useForm, type SubmitHandler, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { createRoomAction } from "../actions";
import { roomSchema, type RoomInput, ROOM_TYPES, roomTypeLabels } from "../../schema";
import { IconArrowsShuffle, IconLoader2 } from "@tabler/icons-react";
import autoSlug from "@/lib/auto-slug";

interface CreateRoomFormProps {
    campusSlug: string;
}

export function CreateRoomForm({ campusSlug }: CreateRoomFormProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const form = useForm<RoomInput>({
        resolver: zodResolver(roomSchema),
        mode: "onChange",
        defaultValues: {
            name: "",
            capacity: "30",
            block: "",
            type: undefined,
            slug: "",
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

    const canSubmit = isValid && isDirty && !isSubmitting && Boolean(nameValue?.trim()) && Boolean(slugValue?.trim());

    useEffect(() => {
        clearErrors();
        reset();
    }, [clearErrors, reset]);

    const onSubmit: SubmitHandler<RoomInput> = async (data) => {
        clearErrors("root");

        try {
            const result = await createRoomAction(campusSlug, data);

            if (result?.success === false) {
                const params = new URLSearchParams(searchParams.toString());
                params.set("toast", "error");
                params.set("message", result.error || "Erro ao criar sala");
                router.replace(`${pathname}?${params.toString()}`, { scroll: false });

                setError("root", {
                    type: "server",
                    message: result.error || "Erro ao criar sala",
                });
                return;
            }

            if (result?.success && result.redirectTo) {
                router.push(result.redirectTo);
                router.refresh();
                return;
            }
        } catch (error) {
            const params = new URLSearchParams(searchParams.toString());
            params.set("toast", "error");
            params.set("message", "Erro fatal ao criar sala");
            router.replace(`${pathname}?${params.toString()}`, { scroll: false });

            setError("root", {
                type: "server",
                message: "Erro fatal ao criar sala",
            });
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
                        placeholder="Ex: 101, Laboratório de Informática..."
                        {...register("name")}
                        disabled={isSubmitting}
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
                            placeholder="Ex: 101"
                            {...register("slug")}
                            disabled={isSubmitting}
                            aria-invalid={errors.slug ? "true" : "false"}
                            className="p-5 rounded-lg bg-background flex-1"
                        />
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
                            disabled={isSubmitting || !nameValue}
                        >
                            <IconArrowsShuffle className="size-5" />
                        </Button>
                    </div>
                    {errors.slug && <p className="text-sm text-red-600">{errors.slug.message}</p>}
                    <p className="text-xs text-muted-foreground italic">O slug será usado na URL e não poderá ser alterado depois.</p>
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
                                disabled={isSubmitting}
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

                <div className="space-y-2 md:col-span-1">
                    <Label htmlFor="capacity">Capacidade *</Label>
                    <Input
                        id="capacity"
                        placeholder="Ex: 30"
                        {...register("capacity")}
                        disabled={isSubmitting}
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
                        disabled={isSubmitting}
                        className="p-5 rounded-lg bg-background"
                    />
                    {errors.block && <p className="text-sm text-red-600">{errors.block.message}</p>}
                </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end pt-4 border-t items-center mt-6">
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
                    {isSubmitting ? "Criando..." : "Criar Sala"}
                </Button>
            </div>
        </form>
    );
}
