"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createAdminAction, promoteTeacherAction } from "../actions";
import { toast } from "sonner";
import type { SystemRole, UserGenre } from "@/generated/prisma/client";

type TeacherOption = {
    id: string;
    name: string;
    email: string;
};

export default function CreateAdminForm({ teachers }: { teachers: TeacherOption[] }) {
    const [mode, setMode] = useState<"new" | "existing">("new");
    const [loading, setLoading] = useState(false);

    const onSubmitNew = async (formData: FormData) => {
        setLoading(true);
        const data = {
            name: formData.get("name") as string,
            email: formData.get("email") as string,
            cpf: formData.get("cpf") as string,
            phone: formData.get("phone") as string,
            birthDate: new Date(formData.get("birthDate") as string),
            genre: formData.get("genre") as UserGenre,
            systemRole: formData.get("systemRole") as SystemRole,
        };

        const result = await createAdminAction(data);

        if (result && !result.success) {
            toast.error(result.error);
            setLoading(false);
        }
    };

    const onSubmitExisting = async (formData: FormData) => {
        setLoading(true);
        const data = {
            teacherId: formData.get("teacherId") as string,
            systemRole: formData.get("systemRole") as SystemRole,
        };

        const result = await promoteTeacherAction(data);

        if (result && !result.success) {
            toast.error(result.error);
            setLoading(false);
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
                <form action={onSubmitNew} className="flex flex-col gap-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="name">Nome completo</Label>
                            <Input id="name" name="name" required placeholder="Ex: João da Silva" className="p-5 rounded-2xl sm:rounded-3xl" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="email">E-mail</Label>
                            <Input id="email" name="email" type="email" required placeholder="joao@escola.com" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="cpf">CPF</Label>
                            <Input id="cpf" name="cpf" required placeholder="000.000.000-00" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="phone">Telefone</Label>
                            <Input id="phone" name="phone" required placeholder="(11) 99999-9999" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="birthDate">Data de Nascimento</Label>
                            <Input id="birthDate" name="birthDate" type="date" required />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="genre">Gênero</Label>
                            <Select name="genre" required defaultValue="PREFER_NOT_TO_SAY">
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="MALE">Masculino</SelectItem>
                                    <SelectItem value="FEMALE">Feminino</SelectItem>
                                    <SelectItem value="NON_BINARY">Não-Binário</SelectItem>
                                    <SelectItem value="PREFER_NOT_TO_SAY">Prefiro não informar</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col gap-2 sm:col-span-2">
                            <Label htmlFor="systemRole">Nível de Acesso</Label>
                            <Select name="systemRole" required defaultValue="FULL_ACCESS">
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o nível de acesso" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="FULL_ACCESS">Acesso Total</SelectItem>
                                    <SelectItem value="READ_ONLY">Somente Leitura</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="flex justify-end mt-4">
                        <Button type="submit" disabled={loading}>
                            {loading ? "Criando..." : "Criar Administrador"}
                        </Button>
                    </div>
                </form>
            ) : (
                <form action={onSubmitExisting} className="flex flex-col gap-6">
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="teacherId">Selecione o Professor</Label>
                            <Select name="teacherId" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Busque um professor..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {teachers.length === 0 && <SelectItem value="none" disabled>Nenhum professor encontrado</SelectItem>}
                                    {teachers.map(t => (
                                        <SelectItem key={t.id} value={t.id}>{t.name} ({t.email})</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="systemRole">Nível de Acesso como Administrador</Label>
                            <Select name="systemRole" required defaultValue="FULL_ACCESS">
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o nível de acesso" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="FULL_ACCESS">Acesso Total</SelectItem>
                                    <SelectItem value="READ_ONLY">Somente Leitura</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="flex justify-end mt-4">
                        <Button type="submit" disabled={loading}>
                            {loading ? "Salvando..." : "Promover a Administrador"}
                        </Button>
                    </div>
                </form>
            )}
        </div>
    );
}
