"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { editStudentAction } from "../../../actions";
import { toast } from "sonner";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { editStudentSchema, type EditStudentData, type EditStudentInput } from "../../../schema";
import { IconCheck, IconCopy, IconLoader2, IconAlertTriangle } from "@tabler/icons-react";
import { deleteStudentAction } from "../../../actions";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Image from "next/image";
import imgGibbyDuvida from "@/assets/images/logo-gibby-duvida.svg";
import type { UserGenre } from "@/generated/prisma/client";
import { useRouter } from "next/navigation";
import { maskCPF, maskPhone, unmask } from "@/lib/masks";
import type { Student } from "@/generated/prisma/client";
import { useState } from "react";

export default function EditStudentForm({ student }: { student: Student }) {
    const router = useRouter();
    const [copied, setCopied] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [adminPasswordConfirm, setAdminPasswordConfirm] = useState("");
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const form = useForm<EditStudentInput, unknown, EditStudentData>({
        resolver: zodResolver(editStudentSchema),
        mode: "all",
        defaultValues: {
            name: student.name,
            email: student.email,
            cpf: student.cpf,
            studentPhone: student.studentPhone,
            parentPhone: student.parentPhone || "",
            school: student.school,
            birthDate: new Date(student.birthDate),
            genre: student.genre as UserGenre,
        },
    });

    const {
        register,
        handleSubmit,
        control,
        reset,
        setError,
        clearErrors,
        formState: { errors, isSubmitting },
    } = form;

    useEffect(() => {
        reset({
            name: student.name,
            email: student.email,
            cpf: student.cpf,
            studentPhone: student.studentPhone,
            parentPhone: student.parentPhone || "",
            school: student.school,
            birthDate: new Date(student.birthDate),
            genre: student.genre as UserGenre,
        });
    }, [student, reset]);

    const onSubmit = async (data: EditStudentData) => {
        clearErrors("root");
        const cleanData = {
            ...data,
            cpf: unmask(data.cpf),
            studentPhone: unmask(data.studentPhone),
            parentPhone: data.parentPhone ? unmask(data.parentPhone) : "",
        };
        const result = await editStudentAction(student.id, cleanData);

        if (result && !result.success) {
            toast.error(result.error);
            setError("root", { type: "server", message: result.error });
        } else {
            toast.success("Aluno atualizado com sucesso!");
            if (result?.redirectTo) {
                router.push(result.redirectTo);
                router.refresh();
            }
        }
    };

    const handleCopyLunaId = async () => {
        if (!student.lunaId) return;
        try {
            await navigator.clipboard.writeText(student.lunaId);
            setCopied(true);
            toast.success("Matrícula copiada!");
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error("Falha ao copiar");
        }
    };

    const onDeleteStudent = async () => {
        setDeleteError(null);
        setIsDeleting(true);

        try {
            const result = await deleteStudentAction(student.id, adminPasswordConfirm);
            if (result?.success === false) {
                setDeleteError(result.error || "Erro ao apagar aluno");
            } else {
                toast.success("Aluno apagado com sucesso");
                router.push("/admin/alunos");
                router.refresh();
            }
        } catch {
            setDeleteError("Erro ao apagar aluno");
        } finally {
            setIsDeleting(false);
        }
    };

    const canDelete = adminPasswordConfirm.length > 0 && !isDeleting;

    return (
        <div className="bg-surface w-full border border-surface-border p-6 rounded-4xl">
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
                            placeholder="Ex: João da Silva"
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
                            placeholder="joao@escola.com"
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
                        <Label htmlFor="school">Escola de Origem *</Label>
                        <Input
                            id="school"
                            {...register("school")}
                            placeholder="Escola Estadual..."
                            className="p-5 h-15.5 rounded-xl bg-background"
                            aria-invalid={errors.school ? "true" : "false"}
                        />
                        {errors.school && <p className="text-sm text-red-600">{errors.school.message}</p>}
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="studentPhone">Celular do Aluno *</Label>
                        <Controller
                            control={control}
                            name="studentPhone"
                            render={({ field }) => (
                                <Input
                                    id="studentPhone"
                                    value={maskPhone(field.value)}
                                    onChange={(e) => field.onChange(maskPhone(e.target.value))}
                                    placeholder="(11) 99999-9999"
                                    className="p-5 h-15.5 rounded-xl bg-background"
                                    aria-invalid={errors.studentPhone ? "true" : "false"}
                                />
                            )}
                        />
                        {errors.studentPhone && <p className="text-sm text-red-600">{errors.studentPhone.message}</p>}
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="parentPhone">Celular do Responsável</Label>
                        <Controller
                            control={control}
                            name="parentPhone"
                            render={({ field }) => (
                                <Input
                                    id="parentPhone"
                                    value={maskPhone(field.value ?? "")}
                                    onChange={(e) => field.onChange(maskPhone(e.target.value))}
                                    placeholder="(11) 99999-9999"
                                    className="p-5 h-15.5 rounded-xl bg-background"
                                    aria-invalid={errors.parentPhone ? "true" : "false"}
                                />
                            )}
                        />
                        {errors.parentPhone && <p className="text-sm text-red-600">{errors.parentPhone.message}</p>}
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
                </div>

                <div className="flex flex-col gap-6 p-6 bg-background rounded-2xl border border-surface-border">
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Matrícula / LunaID</span>
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-lg font-bold text-foreground">
                                {student.lunaId || "Não gerado"}
                            </span>
                            {student.lunaId && (
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
                </div>
                <div className="flex flex-col-reverse justify-end gap-3 pt-4 sm:flex-row mt-4">
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

                <div className="border border-destructive/25 bg-destructive/5 rounded-2xl p-4 sm:p-5 space-y-4 mt-6">
                    <div>
                        <div className="flex flex-row items-center gap-2">
                            <IconAlertTriangle className="size-5 text-red-600" />
                            <h3 className="text-xl font-semibold text-destructive">Zona de Perigo</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                            Esta ação remove o aluno <b>permanentemente</b>. Todos os vínculos (matrículas, presenças e notas) serão desfeitos. Esta ação não pode ser desfeita.
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
                                    Apagar Aluno
                                </Button>
                            </DialogTrigger>
                        </div>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Apagar Aluno</DialogTitle>
                                <DialogDescription>
                                    Deseja realmente apagar este aluno?
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
                                    onClick={onDeleteStudent}
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
            </form>
        </div>
    );
}
