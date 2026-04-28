"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { editMemberAction } from "../actions";
import { toast } from "sonner";
import { SystemRole, User, UserGenre } from "@/generated/prisma/client";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { editMemberSchema, type EditMemberData, type EditMemberInput } from "../schema";
import { IconCheck, IconCopy, IconLoader2 } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { maskCPF, maskPhone } from "@/lib/masks";

export default function EditMemberForm({ member }: { member: User }) {
    const router = useRouter();
    const [copied, setCopied] = useState(false);

    const form = useForm<EditMemberInput, unknown, EditMemberData>({
        resolver: zodResolver(editMemberSchema),
        mode: "all",
        defaultValues: {
            name: member.name,
            cpf: member.cpf,
            email: member.email,
            phone: member.phone,
            birthDate: member.birthDate ? new Date(member.birthDate) : undefined,
            genre: member.genre as UserGenre,
            systemRole: member.systemRole as SystemRole,
            isAdmin: member.isAdmin,
            isTeacher: member.isTeacher,
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

    const onSubmit = async (data: EditMemberData) => {
        clearErrors("root");

        // Validar que pelo menos um vínculo foi selecionado
        if (!data.isAdmin && !data.isTeacher) {
            toast.error("O membro precisa ter pelo menos um vínculo (Admin ou Professor)");
            setError("root", { type: "manual", message: "Selecione pelo menos um vínculo." });
            return;
        }

        const result = await editMemberAction(member.id, data);

        if (result && !result.success) {
            toast.error(result.error);
            setError("root", { type: "server", message: result.error });
        }
    };

    const handleCopyLunaId = async () => {
        if (!member.lunaId) return;
        try {
            await navigator.clipboard.writeText(member.lunaId);
            setCopied(true);
            toast.success("Matrícula copiada!");
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error("Falha ao copiar");
        }
    };

    return (
        <div className="bg-surface border border-surface-border p-6 rounded-3xl">
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
                {errors.root?.message && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-900 text-sm">
                        {errors.root.message}
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                <div className="flex flex-col gap-6 p-6 bg-background rounded-2xl border border-surface-border">
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Matrícula / LunaID</span>
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-lg font-bold text-foreground">
                                    {member.lunaId || "Não gerado"}
                                </span>
                                {member.lunaId && (
                                    <button
                                        type="button"
                                        onClick={handleCopyLunaId}
                                        className="cursor-pointer p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                        title="Copiar matrícula"
                                    >
                                        {copied ? (
                                            <IconCheck className="size-4 text-emerald-500" />
                                        ) : (
                                            <IconCopy className="size-4" />
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="h-px bg-surface-border w-full" />

                        <div className="flex flex-col gap-3">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Vínculos do Membro</span>
                            <div className="flex flex-col gap-3">
                                <label className="flex items-center gap-3 p-3 rounded-xl border border-surface-border bg-surface/50 cursor-pointer hover:bg-surface transition-colors">
                                    <input 
                                        type="checkbox" 
                                        {...register("isAdmin")}
                                        className="size-5 rounded border-surface-border accent-blue-600 cursor-pointer"
                                    />
                                    <div className="flex flex-col">
                                        <span className="font-medium text-sm">Administrador</span>
                                        <span className="text-xs text-muted-foreground">Permite gerenciar a instituição e equipe</span>
                                    </div>
                                </label>

                                <label className="flex items-center gap-3 p-3 rounded-xl border border-surface-border bg-surface/50 cursor-pointer hover:bg-surface transition-colors">
                                    <input
                                        type="checkbox"
                                        {...register("isTeacher")}
                                        className="size-5 rounded border-surface-border accent-purple-600 cursor-pointer"
                                    />
                                    <div className="flex flex-col">
                                        <span className="font-medium text-sm">Professor</span>
                                        <span className="text-xs text-muted-foreground">Permite gerenciar turmas e disciplinas</span>
                                    </div>
                                </label>
                            </div>
                            {(errors.isAdmin || errors.isTeacher) && (
                                <p className="text-sm text-red-600">Selecione pelo menos um vínculo para o membro.</p>
                            )}
                        </div>
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
                        {isSubmitting ? "Salvando..." : "Salvar Alterações"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
