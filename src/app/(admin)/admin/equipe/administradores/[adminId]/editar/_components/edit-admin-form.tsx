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

export default function EditAdminForm({ admin }: { admin: User }) {
    const router = useRouter();
    // Format date for the input (YYYY-MM-DD)
    const formattedDate = admin.birthDate ? new Date(admin.birthDate).toISOString().split("T")[0] : undefined;

    const form = useForm<EditAdminInput, unknown, EditAdminData>({
        resolver: zodResolver(editAdminSchema),
        mode: "onChange",
        defaultValues: {
            name: admin.name,
            email: admin.email,
            cpf: admin.cpf,
            phone: admin.phone,
            birthDate: formattedDate as unknown as Date, // zod string to date coercion
            genre: admin.genre as UserGenre,
            systemRole: admin.systemRole as SystemRole,
        },
    });

    const onSubmit = async (data: EditAdminData) => {
        form.clearErrors("root");
        const result = await editAdminAction(admin.id, data);

        if (result && !result.success) {
            toast.error(result.error);
            form.setError("root", { type: "server", message: result.error });
        }
    };

    const canSubmit = form.formState.isValid && !form.formState.isSubmitting;

    return (
        <div className="bg-surface border border-surface-border p-6 rounded-3xl max-w-3xl">
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
                {form.formState.errors.root?.message && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-900 text-sm">
                        {form.formState.errors.root.message}
                    </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="name">Nome completo *</Label>
                        <Input
                            id="name"
                            {...form.register("name")}
                            className="p-5 h-15.5 rounded-3xl bg-background"
                            aria-invalid={form.formState.errors.name ? "true" : "false"}
                        />
                        {form.formState.errors.name && <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>}
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="email">E-mail *</Label>
                        <Input
                            id="email"
                            type="email"
                            {...form.register("email")}
                            className="p-5 h-[62px] rounded-lg bg-background"
                            aria-invalid={form.formState.errors.email ? "true" : "false"}
                        />
                        {form.formState.errors.email && <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>}
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="cpf">CPF *</Label>
                        <Input
                            id="cpf"
                            {...form.register("cpf")}
                            className="p-5 h-[62px] rounded-lg bg-background"
                            aria-invalid={form.formState.errors.cpf ? "true" : "false"}
                        />
                        {form.formState.errors.cpf && <p className="text-sm text-red-600">{form.formState.errors.cpf.message}</p>}
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="phone">Telefone *</Label>
                        <Input
                            id="phone"
                            {...form.register("phone")}
                            className="p-5 h-[62px] rounded-lg bg-background"
                            aria-invalid={form.formState.errors.phone ? "true" : "false"}
                        />
                        {form.formState.errors.phone && <p className="text-sm text-red-600">{form.formState.errors.phone.message}</p>}
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="birthDate">Data de Nascimento *</Label>
                        <Controller
                            control={form.control}
                            name="birthDate"
                            render={({ field }) => (
                                <Input
                                    id="birthDate"
                                    type="date"
                                    value={field.value instanceof Date && !isNaN(field.value.getTime()) ? field.value.toISOString().slice(0, 10) : ""}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        field.onChange(val ? new Date(`${val}T00:00:00`) : undefined);
                                    }}
                                    className="p-5 h-[62px] rounded-lg bg-background"
                                    aria-invalid={form.formState.errors.birthDate ? "true" : "false"}
                                />
                            )}
                        />
                        {form.formState.errors.birthDate && <p className="text-sm text-red-600">{form.formState.errors.birthDate.message}</p>}
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="genre">Gênero *</Label>
                        <Controller
                            control={form.control}
                            name="genre"
                            render={({ field }) => (
                                <Select value={field.value} onValueChange={(val) => field.onChange(val as UserGenre)}>
                                    <SelectTrigger className="w-full bg-background p-5 h-[62px]" aria-invalid={form.formState.errors.genre ? "true" : "false"}>
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
                        {form.formState.errors.genre && <p className="text-sm text-red-600">{form.formState.errors.genre.message}</p>}
                    </div>
                    <div className="flex flex-col gap-2 sm:col-span-2">
                        <Label htmlFor="systemRole">Nível de Acesso *</Label>
                        <Controller
                            control={form.control}
                            name="systemRole"
                            render={({ field }) => (
                                <Select value={field.value} onValueChange={(val) => field.onChange(val as SystemRole)}>
                                    <SelectTrigger className="w-full bg-background p-5 h-[62px]" aria-invalid={form.formState.errors.systemRole ? "true" : "false"}>
                                        <SelectValue placeholder="Selecione o nível de acesso" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="FULL_ACCESS">Acesso Total</SelectItem>
                                        <SelectItem value="READ_ONLY">Somente Leitura</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {form.formState.errors.systemRole && <p className="text-sm text-red-600">{form.formState.errors.systemRole.message}</p>}
                    </div>
                </div>
                <div className="flex flex-col-reverse justify-end gap-3 pt-4 sm:flex-row mt-4 border-t">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={form.formState.isSubmitting}
                    >
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={!canSubmit}>
                        {form.formState.isSubmitting && <IconLoader2 className="size-4 mr-2 animate-spin" />}
                        {form.formState.isSubmitting ? "Salvando..." : "Concluir"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
