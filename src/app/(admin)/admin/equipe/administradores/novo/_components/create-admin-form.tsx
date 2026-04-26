"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createAdminAction, promoteTeacherAction } from "../actions";
import { toast } from "sonner";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createAdminSchema, promoteTeacherSchema, type CreateAdminData, type CreateAdminInput, type PromoteTeacherInput } from "../schema";
import { IconLoader2 } from "@tabler/icons-react";
import type { SystemRole, UserGenre } from "@/generated/prisma/client";

type TeacherOption = {
    id: string;
    name: string;
    email: string;
};

export default function CreateAdminForm({ teachers }: { teachers: TeacherOption[] }) {
    const [mode, setMode] = useState<"new" | "existing">("new");

    const formNew = useForm<CreateAdminInput, unknown, CreateAdminData>({
        resolver: zodResolver(createAdminSchema),
        defaultValues: {
            name: "",
            email: "",
            cpf: "",
            phone: "",
            birthDate: undefined,
            genre: "PREFER_NOT_TO_SAY",
            systemRole: "FULL_ACCESS",
        },
    });

    const formExisting = useForm<PromoteTeacherInput>({
        resolver: zodResolver(promoteTeacherSchema),
        defaultValues: {
            teacherId: "",
            systemRole: "FULL_ACCESS",
        },
    });

    const onSubmitNew = async (data: CreateAdminData) => {
        formNew.clearErrors("root");
        const result = await createAdminAction(data);

        if (result && !result.success) {
            toast.error(result.error);
            formNew.setError("root", { type: "server", message: result.error });
        }
    };

    const onSubmitExisting = async (data: PromoteTeacherInput) => {
        formExisting.clearErrors("root");
        const result = await promoteTeacherAction(data);

        if (result && !result.success) {
            toast.error(result.error);
            formExisting.setError("root", { type: "server", message: result.error });
        }
    };

    return (
        <div className="bg-surface w-full border border-surface-border p-6 rounded-4xl">
            <div className="flex flex-col sm:flex-row gap-2 mb-8 bg-muted p-1 rounded-2xl sm:rounded-3xl w-full sm:w-fit">
                <Button
                    type="button"
                    variant={mode === "new" ? "default" : "ghost"}
                    onClick={() => setMode("new")}
                    className="rounded-xl sm:rounded-3xl w-full sm:w-auto"
                >
                    Criar do Zero
                </Button>
                <Button
                    type="button"
                    variant={mode === "existing" ? "default" : "ghost"}
                    onClick={() => setMode("existing")}
                    className="rounded-xl sm:rounded-3xl w-full sm:w-auto"
                >
                    Selecionar Professor Existente
                </Button>
            </div>

            {mode === "new" ? (
                <form onSubmit={formNew.handleSubmit(onSubmitNew)} className="flex flex-col gap-6">
                    {formNew.formState.errors.root?.message && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-900 text-sm">
                            {formNew.formState.errors.root.message}
                        </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="name">Nome completo</Label>
                            <Input id="name" {...formNew.register("name")} placeholder="Ex: João da Silva" className="p-5 h-15.5 rounded-lg bg-background" />
                            {formNew.formState.errors.name && <p className="text-sm text-red-600">{formNew.formState.errors.name.message}</p>}
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="email">E-mail</Label>
                            <Input id="email" type="email" {...formNew.register("email")} placeholder="joao@escola.com" className="p-5 h-15.5 rounded-lg bg-background" />
                            {formNew.formState.errors.email && <p className="text-sm text-red-600">{formNew.formState.errors.email.message}</p>}
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="cpf">CPF</Label>
                            <Input id="cpf" {...formNew.register("cpf")} placeholder="000.000.000-00" className="p-5 h-15.5 rounded-lg bg-background" />
                            {formNew.formState.errors.cpf && <p className="text-sm text-red-600">{formNew.formState.errors.cpf.message}</p>}
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="phone">Telefone</Label>
                            <Input id="phone" {...formNew.register("phone")} placeholder="(11) 99999-9999" className="p-5 h-15.5 rounded-lg bg-background" />
                            {formNew.formState.errors.phone && <p className="text-sm text-red-600">{formNew.formState.errors.phone.message}</p>}
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="birthDate">Data de Nascimento</Label>
                            <Input id="birthDate" type="date" {...formNew.register("birthDate")} className="p-5 h-15.5 rounded-lg bg-background" />
                            {formNew.formState.errors.birthDate && <p className="text-sm text-red-600">{formNew.formState.errors.birthDate.message}</p>}
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="genre">Gênero</Label>
                            <Controller
                                control={formNew.control}
                                name="genre"
                                render={({ field }) => (
                                    <Select value={field.value} onValueChange={(val) => field.onChange(val as UserGenre)}>
                                        <SelectTrigger className="w-full bg-background p-5 h-15.5 rounded-2xl">
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
                            {formNew.formState.errors.genre && <p className="text-sm text-red-600">{formNew.formState.errors.genre.message}</p>}
                        </div>
                        <div className="flex flex-col gap-2 sm:col-span-2">
                            <Label htmlFor="systemRole">Nível de Acesso</Label>
                            <Controller
                                control={formNew.control}
                                name="systemRole"
                                render={({ field }) => (
                                    <Select value={field.value} onValueChange={(val) => field.onChange(val as SystemRole)}>
                                        <SelectTrigger className="w-full bg-background p-5 h-15.5 rounded-2xl">
                                            <SelectValue placeholder="Selecione o nível de acesso" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="FULL_ACCESS">Acesso Total</SelectItem>
                                            <SelectItem value="READ_ONLY">Somente Leitura</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {formNew.formState.errors.systemRole && <p className="text-sm text-red-600">{formNew.formState.errors.systemRole.message}</p>}
                        </div>
                    </div>
                    <div className="flex justify-end mt-4">
                        <Button type="submit" disabled={formNew.formState.isSubmitting}>
                            {formNew.formState.isSubmitting && <IconLoader2 className="size-4 mr-2 animate-spin" />}
                            {formNew.formState.isSubmitting ? "Criando..." : "Criar Administrador"}
                        </Button>
                    </div>
                </form>
            ) : (
                <form onSubmit={formExisting.handleSubmit(onSubmitExisting)} className="flex flex-col gap-6">
                    {formExisting.formState.errors.root?.message && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-900 text-sm">
                            {formExisting.formState.errors.root.message}
                        </div>
                    )}
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="teacherId">Selecione o Professor</Label>
                            <Controller
                                control={formExisting.control}
                                name="teacherId"
                                render={({ field }) => (
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger className="w-full bg-background p-5 h-15.5 rounded-2xl">
                                            <SelectValue placeholder="Busque um professor..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {teachers.length === 0 && <SelectItem value="none" disabled>Nenhum professor encontrado</SelectItem>}
                                            {teachers.map(t => (
                                                <SelectItem key={t.id} value={t.id}>{t.name} ({t.email})</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {formExisting.formState.errors.teacherId && <p className="text-sm text-red-600">{formExisting.formState.errors.teacherId.message}</p>}
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="systemRole">Nível de Acesso como Administrador</Label>
                            <Controller
                                control={formExisting.control}
                                name="systemRole"
                                render={({ field }) => (
                                    <Select value={field.value} onValueChange={(val) => field.onChange(val as SystemRole)}>
                                        <SelectTrigger className="w-full bg-background p-5 h-15.5 rounded-2xl">
                                            <SelectValue placeholder="Selecione o nível de acesso" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="FULL_ACCESS">Acesso Total</SelectItem>
                                            <SelectItem value="READ_ONLY">Somente Leitura</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {formExisting.formState.errors.systemRole && <p className="text-sm text-red-600">{formExisting.formState.errors.systemRole.message}</p>}
                        </div>
                    </div>
                    <div className="flex justify-end mt-4">
                        <Button type="submit" disabled={formExisting.formState.isSubmitting}>
                            {formExisting.formState.isSubmitting && <IconLoader2 className="size-4 mr-2 animate-spin" />}
                            {formExisting.formState.isSubmitting ? "Salvando..." : "Promover a Administrador"}
                        </Button>
                    </div>
                </form>
            )}
        </div>
    );
}
