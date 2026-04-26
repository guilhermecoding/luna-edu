"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { editAdminAction } from "../actions";
import { toast } from "sonner";
import type { SystemRole, User, UserGenre } from "@/generated/prisma/client";

export default function EditAdminForm({ admin }: { admin: User }) {
    const [loading, setLoading] = useState(false);

    const onSubmit = async (formData: FormData) => {
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

        const result = await editAdminAction(admin.id, data);
        
        if (result && !result.success) {
            toast.error(result.error);
            setLoading(false);
        }
    };

    // Format date for the input (YYYY-MM-DD)
    const formattedDate = admin.birthDate ? new Date(admin.birthDate).toISOString().split("T")[0] : "";

    return (
        <div className="bg-surface border border-surface-border p-6 rounded-3xl max-w-3xl">
            <form action={onSubmit} className="flex flex-col gap-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="name">Nome completo</Label>
                        <Input id="name" name="name" required defaultValue={admin.name} />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="email">E-mail</Label>
                        <Input id="email" name="email" type="email" required defaultValue={admin.email} />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="cpf">CPF</Label>
                        <Input id="cpf" name="cpf" required defaultValue={admin.cpf} />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="phone">Telefone</Label>
                        <Input id="phone" name="phone" required defaultValue={admin.phone} />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="birthDate">Data de Nascimento</Label>
                        <Input id="birthDate" name="birthDate" type="date" required defaultValue={formattedDate} />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="genre">Gênero</Label>
                        <Select name="genre" required defaultValue={admin.genre}>
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
                        <Select name="systemRole" required defaultValue={admin.systemRole}>
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
                        {loading ? "Salvando..." : "Salvar Alterações"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
