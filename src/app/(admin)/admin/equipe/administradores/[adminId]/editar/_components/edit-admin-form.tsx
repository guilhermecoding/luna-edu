"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { editAdminAction } from "../actions";
import { toast } from "sonner";
import { SystemRole, User, UserGenre } from "@/generated/prisma/client";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { editAdminSchema, type EditAdminData, type EditAdminInput } from "../schema";
import { IconLoader2 } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { maskCPF, maskPhone, unmask } from "@/lib/masks";

export default function EditAdminForm({ admin }: { admin: User }) {
    const router = useRouter();
    const form = useForm<EditAdminInput, unknown, EditAdminData>({
        resolver: zodResolver(editAdminSchema),
        mode: "all",
        defaultValues: {
            name: admin.name,
            email: admin.email,
            cpf: admin.cpf,
            phone: admin.phone,
            birthDate: admin.birthDate ? new Date(admin.birthDate) : undefined,
            genre: admin.genre as UserGenre,
            systemRole: admin.systemRole as SystemRole,
        },
    });

    const {
        register,
        handleSubmit,
        control,
        setError,
        clearErrors,
        formState: { errors, isSubmitting },
    } = form;

    useEffect(() => {
        form.trigger();
    }, [form]);

    const onSubmit = async (data: EditAdminData) => {
        clearErrors("root");
        // Garantir que os dados vão limpos para o banco
        const cleanData = {
            ...data,
            cpf: unmask(data.cpf),
            phone: unmask(data.phone),
        };
        const result = await editAdminAction(admin.id, cleanData);

        if (result && !result.success) {
            toast.error(result.error);
            setError("root", { type: "server", message: result.error });
        }
    };

    return (
        <div className="bg-surface border border-surface-border p-6 rounded-3xl max-w-3xl">
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
                {errors.root?.message && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-900 text-sm">
                        {errors.root.message}
                    </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="lunaId">Matrícula/LunaID</Label>
                        <Input
                            id="lunaId"
                            value={admin.lunaId || "Não gerado"}
                            readOnly
                            className="p-5 h-15.5 rounded-xl bg-background"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="name">Nome completo *</Label>
                        <Input
                            id="name"
                            {...register("name")}
                            className="p-5 h-15.5 rounded-xl bg-background"
                            aria-invalid={errors.name ? "true" : "false"}
                        />
                        {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="email">E-mail *</Label>
                        <Input
                            id="email"
                            type="email"
                            {...register("email")}
                            className="p-5 h-15.5 rounded-xl bg-background"
                            aria-invalid={errors.email ? "true" : "false"}
                        />
                        {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="cpf">CPF *</Label>
                        <Controller
                            control={control}
                            name="cpf"
                            render={({ field }) => (
                                <Input
                                    id="cpf"
                                    value={maskCPF(field.value)}
                                    onChange={(e) => field.onChange(maskCPF(e.target.value))}
                                    placeholder="000.000.000-00"
                                    className="p-5 h-15.5 rounded-xl bg-background"
                                    aria-invalid={errors.cpf ? "true" : "false"}
                                />
                            )}
                        />
                        {errors.cpf && <p className="text-sm text-red-600">{errors.cpf.message}</p>}
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="phone">Telefone *</Label>
                        <Controller
                            control={control}
                            name="phone"
                            render={({ field }) => (
                                <Input
                                    id="phone"
                                    value={maskPhone(field.value)}
                                    onChange={(e) => field.onChange(maskPhone(e.target.value))}
                                    placeholder="(11) 99999-9999"
                                    className="p-5 h-15.5 rounded-xl bg-background"
                                    aria-invalid={errors.phone ? "true" : "false"}
                                />
                            )}
                        />
                        {errors.phone && <p className="text-sm text-red-600">{errors.phone.message}</p>}
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="birthDate">Data de Nascimento *</Label>
                        <Controller
                            control={control}
                            name="birthDate"
                            render={({ field }) => (
                                <Input
                                    id="birthDate"
                                    type="date"
                                    value={field.value instanceof Date && !isNaN(field.value.getTime()) ? field.value.toISOString().slice(0, 10) : ""}
                                    onClick={(e) => {
                                        try {
                                            e.currentTarget.showPicker?.();
                                        } catch { }
                                    }}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        field.onChange(val ? new Date(`${val}T00:00:00`) : undefined);
                                    }}
                                    className="p-5 h-15.5 rounded-xl bg-background"
                                    aria-invalid={errors.birthDate ? "true" : "false"}
                                />
                            )}
                        />
                        {errors.birthDate && <p className="text-sm text-red-600">{errors.birthDate.message}</p>}
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="genre">Gênero *</Label>
                        <Controller
                            control={control}
                            name="genre"
                            render={({ field }) => (
                                <Select value={field.value} onValueChange={(val) => field.onChange(val as UserGenre)}>
                                    <SelectTrigger className="w-full bg-background p-5 h-15.5 rounded-xl" aria-invalid={errors.genre ? "true" : "false"}>
                                        <SelectValue placeholder="Selecione..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="MALE">Masculino</SelectItem>
                                        <SelectItem value="FEMALE">Feminino</SelectItem>
                                        <SelectItem value="NON_BINARY">Não-Binário</SelectItem>
                                        <SelectItem value="PREFER_NOT_TO_SAY">Prefiro não informar</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.genre && <p className="text-sm text-red-600">{errors.genre.message}</p>}
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="systemRole">Nível de Acesso *</Label>
                        <Controller
                            control={control}
                            name="systemRole"
                            render={({ field }) => (
                                <Select value={field.value} onValueChange={(val) => field.onChange(val as SystemRole)}>
                                    <SelectTrigger className="w-full bg-background p-5 h-15.5 rounded-xl" aria-invalid={errors.systemRole ? "true" : "false"}>
                                        <SelectValue placeholder="Selecione o nível de acesso" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="FULL_ACCESS">Acesso Total</SelectItem>
                                        <SelectItem value="READ_ONLY">Somente Leitura</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.systemRole && <p className="text-sm text-red-600">{errors.systemRole.message}</p>}
                    </div>
                </div>
                <div className="flex flex-col-reverse justify-end gap-3 pt-4 sm:flex-row mt-4 border-t">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={isSubmitting}
                    >
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <IconLoader2 className="size-4 mr-2 animate-spin" />}
                        {isSubmitting ? "Salvando..." : "Concluir"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
