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
import { IconAlertTriangle, IconCheck, IconCopy, IconLoader2, IconLock } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { maskCPF, maskPhone } from "@/lib/masks";
import { authClient } from "@/lib/auth-client";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Image from "next/image";
import imgGibbyDuvida from "@/assets/images/logo-gibby-duvida.svg";
import { deleteMemberAction } from "../actions";

export default function EditMemberForm({
    member,
    isEditingSelf,
}: {
    member: User;
    isEditingSelf: boolean;
}) {
    const lockSelfAdmin = isEditingSelf && member.isAdmin;
    const router = useRouter();
    const [copied, setCopied] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [pendingStatus, setPendingStatus] = useState<boolean | null>(null);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [adminPasswordConfirm, setAdminPasswordConfirm] = useState("");
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

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
            isActive: member.isActive,
        },
    });

    const {
        register,
        handleSubmit,
        control,
        setError,
        clearErrors,
        reset,
        formState: { errors, isSubmitting },
    } = form;

    // Sincroniza o formulário com os dados originais sempre que o prop 'member' mudar
    // Isso garante que o formulário não mantenha estados de edições anteriores
    useEffect(() => {
        reset({
            name: member.name,
            cpf: member.cpf,
            email: member.email,
            phone: member.phone,
            birthDate: member.birthDate ? new Date(member.birthDate) : undefined,
            genre: member.genre as UserGenre,
            systemRole: member.systemRole as SystemRole,
            isAdmin: member.isAdmin,
            isTeacher: member.isTeacher,
            isActive: member.isActive,
        });
    }, [member, reset]);

    useEffect(() => {
        form.trigger();
    }, [form]);

    const onSubmit = async (data: EditMemberData) => {
        clearErrors("root");

        const payload: EditMemberData = {
            ...data,
            ...(lockSelfAdmin ? { isAdmin: true } : {}),
        };

        // Validar que pelo menos um vínculo foi selecionado
        if (!payload.isAdmin && !payload.isTeacher) {
            toast.error("O membro precisa ter pelo menos um vínculo (Admin ou Professor)");
            setError("root", { type: "manual", message: "Selecione pelo menos um vínculo." });
            return;
        }

        const result = await editMemberAction(member.id, payload);

        if (result && !result.success) {
            toast.error(result.error);
            setError("root", { type: "server", message: result.error });
            return;
        }

        if (result?.success && typeof result.redirectTo === "string") {
            await authClient.getSession({
                query: { disableCookieCache: true },
            });
            router.push(result.redirectTo);
            router.refresh();
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

    const canDelete = adminPasswordConfirm.length > 0 && !isDeleting;

    const onDeleteMember = async () => {
        setDeleteError(null);
        setIsDeleting(true);

        try {
            const result = await deleteMemberAction(member.id, adminPasswordConfirm);
            if (result?.success === false) {
                setDeleteError(result.error || "Erro ao apagar usuário");
            } else {
                toast.success("Usuário apagado com sucesso");
                router.push("/admin/equipe");
                router.refresh();
            }
        } catch (error) {
            setDeleteError("Erro ao apagar usuário");
        } finally {
            setIsDeleting(false);
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
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="isActive">Acesso ao Sistema *</Label>
                        <Controller
                            control={control}
                            name="isActive"
                            render={({ field }) => (
                                <Select
                                    value={field.value ? "active" : "inactive"}
                                    onValueChange={(val) => {
                                        const nextStatus = val === "active";
                                        if (nextStatus !== field.value) {
                                            setPendingStatus(nextStatus);
                                            setShowStatusModal(true);
                                        }
                                    }}
                                >
                                    <SelectTrigger className="w-full bg-background p-5 h-15.5 rounded-xl" aria-invalid={errors.isActive ? "true" : "false"}>
                                        <SelectValue placeholder="Selecione o status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Ativado</SelectItem>
                                        <SelectItem value="inactive">Desativado</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.isActive && <p className="text-sm text-red-600">{errors.isActive.message}</p>}
                    </div>
                </div>

                <div className="flex flex-col gap-6 mt-4">
                    <div className="flex items-center gap-4">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                            Acesso do Usuário
                        </span>
                        <div className="h-px bg-surface-border flex-1" />
                    </div>

                    <div className="flex flex-col gap-6">
                        <h3 className="text-xl font-bold text-foreground">Alterar senha do usuário</h3>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="password">Nova senha</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    {...register("password")}
                                    placeholder="••••••••"
                                    className="p-5 h-15.5 rounded-xl bg-background"
                                    aria-invalid={errors.password ? "true" : "false"}
                                />
                                {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="confirmPassword">Repetir a senha</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    {...register("confirmPassword")}
                                    placeholder="••••••••"
                                    className="p-5 h-15.5 rounded-xl bg-background"
                                    aria-invalid={errors.confirmPassword ? "true" : "false"}
                                />
                                {errors.confirmPassword && <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>}
                            </div>
                        </div>
                    </div>
                </div>

                <Dialog open={showStatusModal} onOpenChange={setShowStatusModal}>
                    <DialogContent className="sm:max-w-md border-none bg-surface p-8 rounded-3xl overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-primary-theme opacity-20" />

                        <div className="flex flex-col items-center text-center gap-6">
                            <div className="relative size-32 animate-bounce-slow">
                                <Image
                                    src="/gibby-normal-icon.svg"
                                    alt="Gibby"
                                    fill
                                    className="object-contain"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <DialogHeader>
                                    <DialogTitle className="text-2xl font-bold text-center">
                                        {pendingStatus ? "Ativar Usuário?" : "Desativar Usuário?"}
                                    </DialogTitle>
                                </DialogHeader>
                                <DialogDescription className="text-muted-foreground text-base">
                                    {pendingStatus ? (
                                        "Ao ativar este usuário, ele recuperará o acesso total ao sistema imediatamente utilizando seu login e senha cadastrados."
                                    ) : (
                                        "Atenção! Ao desativar este usuário, ele perderá o acesso ao sistema na mesma hora. Mesmo com a senha correta, o acesso será bloqueado."
                                    )}
                                </DialogDescription>
                            </div>
                        </div>

                        <DialogFooter className="flex flex-row gap-3 mt-4">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1 h-12"
                                onClick={() => {
                                    setShowStatusModal(false);
                                    setPendingStatus(null);
                                }}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="button"
                                className="flex-1 h-12 bg-primary-theme hover:bg-primary-theme/90"
                                onClick={() => {
                                    if (pendingStatus !== null) {
                                        form.setValue("isActive", pendingStatus, { shouldDirty: true, shouldValidate: true });
                                    }
                                    setShowStatusModal(false);
                                    setPendingStatus(null);
                                }}
                            >
                                Confirmar
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

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
                                {lockSelfAdmin ? (
                                    <div className="flex items-start gap-3 p-3 rounded-xl border border-surface-border bg-muted/30 text-muted-foreground">
                                        <IconLock className="size-5 shrink-0 mt-0.5 text-foreground/70" aria-hidden />
                                        <div className="flex flex-col gap-0.5">
                                            <span className="font-medium text-sm text-foreground">Administrador</span>
                                            <span className="text-xs leading-relaxed">
                                                Seu perfil mantém este vínculo por segurança. Ele não pode ser removido ao editar a própria conta.
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <label className="flex items-center gap-3 p-3 rounded-xl border border-surface-border bg-surface/50 cursor-pointer hover:bg-surface transition-colors">
                                        <input
                                            type="checkbox"
                                            {...register("isAdmin")}
                                            className="size-5 rounded border-surface-border accent-primary-theme cursor-pointer"
                                        />
                                        <div className="flex flex-col">
                                            <span className="font-medium text-sm">Administrador</span>
                                            <span className="text-xs text-muted-foreground">Permite gerenciar a instituição e equipe</span>
                                        </div>
                                    </label>
                                )}

                                <label className="flex items-center gap-3 p-3 rounded-xl border border-surface-border bg-surface/50 cursor-pointer hover:bg-surface transition-colors">
                                    <input
                                        type="checkbox"
                                        {...register("isTeacher")}
                                        className="size-5 rounded border-surface-border accent-primary-theme cursor-pointer"
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

                {!isEditingSelf && (
                    <div className="border border-destructive/25 bg-destructive/5 rounded-2xl p-4 sm:p-5 space-y-4 mt-6">
                        <div>
                            <div className="flex flex-row items-center gap-2">
                                <IconAlertTriangle className="size-5 text-red-600" />
                                <h3 className="text-xl font-semibold text-destructive">Zona de Perigo</h3>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                                Esta ação remove o usuário <b>permanentemente</b>. Todos os vínculos (horários e aulas) serão desfeitos. Esta ação não pode ser desfeita.
                            </p>
                        </div>

                        <Dialog
                            open={isDeleteModalOpen}
                            onOpenChange={(open) => {
                                setIsDeleteModalOpen(open);
                                if (!open) {
                                    setAdminPasswordConfirm("");
                                    setDeleteError(null);
                                }
                            }}
                        >
                            <div className="w-full flex justify-end">
                                <DialogTrigger asChild>
                                    <Button type="button" variant="destructive" className="w-full sm:w-auto">
                                        Apagar Usuário
                                    </Button>
                                </DialogTrigger>
                            </div>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Apagar Usuário</DialogTitle>
                                    <DialogDescription>
                                        Deseja realmente apagar este usuário?
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="flex flex-col items-center text-center">
                                    <Image className="w-32 h-32" src={imgGibbyDuvida} alt="Gibby Duvida" width={100} height={100} />
                                    <span> Para confirmar, digite sua senha de administrador:</span>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirm-delete-password">Sua senha</Label>
                                    <Input
                                        id="confirm-delete-password"
                                        type="password"
                                        value={adminPasswordConfirm}
                                        onChange={(event) => setAdminPasswordConfirm(event.target.value)}
                                        placeholder="••••••••"
                                        className="rounded-lg"
                                        disabled={isDeleting}
                                    />
                                    {deleteError && <p className="text-sm text-red-600">{deleteError}</p>}
                                </div>

                                <DialogFooter>
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
                                        onClick={onDeleteMember}
                                        disabled={!canDelete}
                                        className="flex items-center gap-2"
                                    >
                                        {isDeleting && <IconLoader2 className="size-5 animate-spin" />}
                                        {isDeleting ? "Apagando..." : "Apagar"}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                )}
            </form>
        </div>
    );
}
