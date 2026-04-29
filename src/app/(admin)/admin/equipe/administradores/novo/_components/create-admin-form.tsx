"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createAdminAction, promoteTeacherAction } from "../actions";
import { toast } from "sonner";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createAdminSchema, promoteTeacherSchema, type CreateAdminData, type CreateAdminInput, type PromoteTeacherInput } from "../schema";
import { IconLoader2, IconPlus } from "@tabler/icons-react";
import type { SystemRole, UserGenre } from "@/generated/prisma/client";
import { useRouter } from "next/navigation";
import { ButtonLink } from "@/components/ui/button-link";
import { maskCPF, maskPhone, unmask } from "@/lib/masks";

type TeacherOption = {
    id: string;
    name: string;
    email: string;
};

export default function CreateAdminForm({ teachers }: { teachers: TeacherOption[] }) {
    const router = useRouter();
    const [mode, setMode] = useState<"new" | "existing">("new");

    const formNew = useForm<CreateAdminInput, unknown, CreateAdminData>({
        resolver: zodResolver(createAdminSchema),
        mode: "all",
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
        mode: "all",
        defaultValues: {
            teacherId: "",
            systemRole: "FULL_ACCESS",
        },
    });

    const {
        register: registerNew,
        handleSubmit: handleSubmitNew,
        control: controlNew,
        reset: resetNew,
        setError: setErrorNew,
        clearErrors: clearErrorsNew,
        formState: { errors: errorsNew, isSubmitting: isSubmittingNew },
    } = formNew;

    const {
        handleSubmit: handleSubmitExisting,
        control: controlExisting,
        reset: resetExisting,
        setError: setErrorExisting,
        clearErrors: clearErrorsExisting,
        formState: { errors: errorsExisting, isSubmitting: isSubmittingExisting },
    } = formExisting;

    useEffect(() => {
        resetNew();
        resetExisting();
    }, [resetNew, resetExisting]);

    const onSubmitNew = async (data: CreateAdminData) => {
        clearErrorsNew("root");
        // Garantir que os dados vão limpos para o banco
        const cleanData = {
            ...data,
            cpf: unmask(data.cpf),
            phone: unmask(data.phone),
        };
        const result = await createAdminAction(cleanData);

        if (result && !result.success) {
            toast.error(result.error);
            setErrorNew("root", { type: "server", message: result.error });
        }
    };

    const onSubmitExisting = async (data: PromoteTeacherInput) => {
        clearErrorsExisting("root");
        const result = await promoteTeacherAction(data);

        if (result && !result.success) {
            toast.error(result.error);
            setErrorExisting("root", { type: "server", message: result.error });
        }
    };

    return (
        <div className="bg-surface w-full border border-surface-border p-6 rounded-4xl">
            <div className="flex flex-col sm:flex-row gap-2 mb-8 bg-background p-1 rounded-2xl sm:rounded-3xl w-full sm:w-fit">
                <Button
                    type="button"
                    variant={mode === "new" ? "default" : "ghost"}
                    onClick={() => setMode("new")}
                    className="rounded-xl sm:rounded-3xl w-full sm:w-auto"
                >
                    Novo
                </Button>
                <Button
                    type="button"
                    variant={mode === "existing" ? "default" : "ghost"}
                    onClick={() => setMode("existing")}
                    className="rounded-xl sm:rounded-3xl w-full sm:w-auto"
                >
                    Professor Existente
                </Button>
            </div>

            {mode === "new" ? (
                <form onSubmit={handleSubmitNew(onSubmitNew)} className="flex flex-col gap-6">
                    {errorsNew.root?.message && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-900 text-sm">
                            {errorsNew.root.message}
                        </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="name">Nome completo *</Label>
                            <Input
                                id="name"
                                {...registerNew("name")}
                                placeholder="Ex: João da Silva"
                                className="p-5 h-15.5 rounded-xl bg-background"
                                aria-invalid={errorsNew.name ? "true" : "false"}
                            />
                            {errorsNew.name && <p className="text-sm text-red-600">{errorsNew.name.message}</p>}
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="email">E-mail *</Label>
                            <Input
                                id="email"
                                type="email"
                                {...registerNew("email")}
                                placeholder="joao@escola.com"
                                className="p-5 h-15.5 rounded-xl bg-background"
                                aria-invalid={errorsNew.email ? "true" : "false"}
                            />
                            {errorsNew.email && <p className="text-sm text-red-600">{errorsNew.email.message}</p>}
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="cpf">CPF *</Label>
                            <Controller
                                control={controlNew}
                                name="cpf"
                                render={({ field }) => (
                                    <Input
                                        id="cpf"
                                        value={maskCPF(field.value)}
                                        onChange={(e) => field.onChange(maskCPF(e.target.value))}
                                        placeholder="000.000.000-00"
                                        className="p-5 h-15.5 rounded-xl bg-background"
                                        aria-invalid={errorsNew.cpf ? "true" : "false"}
                                    />
                                )}
                            />
                            {errorsNew.cpf && <p className="text-sm text-red-600">{errorsNew.cpf.message}</p>}
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="phone">Telefone *</Label>
                            <Controller
                                control={controlNew}
                                name="phone"
                                render={({ field }) => (
                                    <Input
                                        id="phone"
                                        value={maskPhone(field.value)}
                                        onChange={(e) => field.onChange(maskPhone(e.target.value))}
                                        placeholder="(11) 99999-9999"
                                        className="p-5 h-15.5 rounded-xl bg-background"
                                        aria-invalid={errorsNew.phone ? "true" : "false"}
                                    />
                                )}
                            />
                            {errorsNew.phone && <p className="text-sm text-red-600">{errorsNew.phone.message}</p>}
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="birthDate">Data de Nascimento *</Label>
                            <Controller
                                control={controlNew}
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
                                        aria-invalid={errorsNew.birthDate ? "true" : "false"}
                                    />
                                )}
                            />
                            {errorsNew.birthDate && <p className="text-sm text-red-600">{errorsNew.birthDate.message}</p>}
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="genre">Gênero *</Label>
                            <Controller
                                control={controlNew}
                                name="genre"
                                render={({ field }) => (
                                    <Select value={field.value} onValueChange={(val) => field.onChange(val as UserGenre)}>
                                        <SelectTrigger className="w-full bg-background p-5 h-15.5 rounded-xl" aria-invalid={errorsNew.genre ? "true" : "false"}>
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
                            {errorsNew.genre && <p className="text-sm text-red-600">{errorsNew.genre.message}</p>}
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="systemRole">Nível de Acesso *</Label>
                            <Controller
                                control={controlNew}
                                name="systemRole"
                                render={({ field }) => (
                                    <Select value={field.value} onValueChange={(val) => field.onChange(val as SystemRole)}>
                                        <SelectTrigger className="w-full bg-background p-5 h-15.5 rounded-xl" aria-invalid={errorsNew.systemRole ? "true" : "false"}>
                                            <SelectValue placeholder="Selecione o nível de acesso" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="FULL_ACCESS">Acesso Total</SelectItem>
                                            <SelectItem value="READ_ONLY">Somente Leitura</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errorsNew.systemRole && <p className="text-sm text-red-600">{errorsNew.systemRole.message}</p>}
                        </div>
                    </div>
                    <div className="flex flex-col-reverse justify-end gap-3 pt-4 sm:flex-row mt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                            disabled={isSubmittingNew}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isSubmittingNew}>
                            {isSubmittingNew && <IconLoader2 className="size-4 mr-2 animate-spin" />}
                            {isSubmittingNew ? "Criando..." : "Concluir"}
                        </Button>
                    </div>
                </form>
            ) : (
                <form onSubmit={handleSubmitExisting(onSubmitExisting)} className="flex flex-col gap-6">
                    {errorsExisting.root?.message && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-900 text-sm">
                            {errorsExisting.root.message}
                        </div>
                    )}
                    {teachers.length === 0 ? (
                        <div className="p-8 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-surface-border rounded-xl bg-surface/30 text-center">
                            <p className="text-sm text-muted-foreground">
                                Nenhum professor cadastrado.
                                <br /> Comece cadastrando o professor na equipe.
                            </p>
                            <ButtonLink variant="outline" href="/admin/equipe/professores" className="w-full sm:w-auto">
                                <IconPlus className="size-4 mr-1" />
                                Adicionar Professor
                            </ButtonLink>
                        </div>
                    ) : (
                        <>
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="teacherId">Selecione o Professor *</Label>
                                    <Controller
                                        control={controlExisting}
                                        name="teacherId"
                                        render={({ field }) => (
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <SelectTrigger className="w-full bg-background p-5 h-15.5 rounded-xl" aria-invalid={errorsExisting.teacherId ? "true" : "false"}>
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
                                    {errorsExisting.teacherId && <p className="text-sm text-red-600">{errorsExisting.teacherId.message}</p>}
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="systemRole">Nível de Acesso como Administrador *</Label>
                                    <Controller
                                        control={controlExisting}
                                        name="systemRole"
                                        render={({ field }) => (
                                            <Select value={field.value} onValueChange={(val) => field.onChange(val as SystemRole)}>
                                                <SelectTrigger className="w-full bg-background p-5 h-15.5 rounded-xl" aria-invalid={errorsExisting.systemRole ? "true" : "false"}>
                                                    <SelectValue placeholder="Selecione o nível de acesso" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="FULL_ACCESS">Acesso Total</SelectItem>
                                                    <SelectItem value="READ_ONLY">Somente Leitura</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {errorsExisting.systemRole && <p className="text-sm text-red-600">{errorsExisting.systemRole.message}</p>}
                                </div>
                            </div>
                            <div className="flex flex-col-reverse justify-end gap-3 pt-4 sm:flex-row mt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.back()}
                                    disabled={isSubmittingExisting}
                                >
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={isSubmittingExisting}>
                                    {isSubmittingExisting && <IconLoader2 className="size-4 mr-2 animate-spin" />}
                                    {isSubmittingExisting ? "Salvando..." : "Concluir"}
                                </Button>
                            </div>
                        </>
                    )}
                </form>
            )}
        </div>
    );
}
