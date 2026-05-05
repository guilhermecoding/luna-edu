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
import { IconCheck, IconCopy, IconLoader2 } from "@tabler/icons-react";
import type { UserGenre } from "@/generated/prisma/client";
import { useRouter } from "next/navigation";
import { maskCPF, maskPhone, unmask } from "@/lib/masks";
import type { Student } from "@/generated/prisma/client";
import { useState } from "react";

export default function EditStudentForm({ student }: { student: Student }) {
    const router = useRouter();
    const [copied, setCopied] = useState(false);

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
            </form>
        </div>
    );
}
