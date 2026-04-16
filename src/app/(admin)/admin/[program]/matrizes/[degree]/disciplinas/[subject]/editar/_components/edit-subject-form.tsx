"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useForm, type SubmitHandler, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { useEffect, useState } from "react";
import { deleteSubjectAction, editSubjectAction } from "../actions";
import { createSubjectSchema } from "../../../novo/schema";
import { IconAlertTriangle, IconLoader2 } from "@tabler/icons-react";
import Image from "next/image";
import imgGibbyDuvida from "@/assets/images/logo-gibby-duvida.svg";
import { isRedirectError } from "@/lib/is-redirect-error";
import { Subject } from "@/generated/prisma/client";

const editSubjectSchema = createSubjectSchema;
type FormInput = z.input<typeof editSubjectSchema>;
type FormOutput = z.output<typeof editSubjectSchema>;

type Props = {
    programSlug: string;
    degreeSlug: string;
    degreeId: string;
    subjectId: string;
    initialData: Subject;
};

export function EditSubjectForm({ programSlug, degreeSlug, degreeId, subjectId, initialData }: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteConfirmationName, setDeleteConfirmationName] = useState("");
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const form = useForm<FormInput, undefined, FormOutput>({
        resolver: zodResolver(editSubjectSchema),
        mode: "onChange",
        defaultValues: {
            name: initialData.name,
            code: initialData.code || "",
            workload: initialData.workload || undefined,
            basePeriod: initialData.basePeriod || undefined,
        },
    });

    const {
        register,
        control,
        formState: { errors, isSubmitting, isValid, isDirty },
        setError,
        clearErrors,
    } = form;

    const nameValue = useWatch({ control, name: "name" });
    const canSubmit = isValid && isDirty && !isSubmitting;
    const canDelete = deleteConfirmationName === initialData.name && !isDeleting;

    useEffect(() => {
        clearErrors();
    }, [clearErrors]);

    const onSubmit: SubmitHandler<FormOutput> = async (data: FormOutput) => {
        clearErrors("root");

        try {
            const result = await editSubjectAction(subjectId, programSlug, degreeSlug, degreeId, data);
            if (result?.success === false) {
                const params = new URLSearchParams(searchParams.toString());
                params.set("toast", "error");
                params.set("message", result.error || "Erro ao editar disciplina");
                router.replace(`${pathname}?${params.toString()}`, { scroll: false });

                setError("root", {
                    type: "server",
                    message: result.error || "Erro ao editar disciplina",
                });
                return;
            }
        } catch (error) {
            if (isRedirectError(error)) {
                throw error;
            }

            const params = new URLSearchParams(searchParams.toString());
            params.set("toast", "error");
            params.set("message", "Erro fatal ao editar disciplina");
            router.replace(`${pathname}?${params.toString()}`, { scroll: false });

            setError("root", {
                type: "server",
                message: "Erro fatal ao editar disciplina",
            });
        }
    };

    const onDeleteSubject = async () => {
        setDeleteError(null);
        setIsDeleting(true);

        try {
            const result = await deleteSubjectAction(subjectId, programSlug, degreeSlug, degreeId);
            if (result?.success === false) {
                const params = new URLSearchParams(searchParams.toString());
                params.set("toast", "error");
                params.set("message", result.error || "Erro ao excluir disciplina");
                router.replace(`${pathname}?${params.toString()}`, { scroll: false });

                setDeleteError(result.error || "Erro ao excluir disciplina");
            }
        } catch (error) {
            if (isRedirectError(error)) {
                throw error;
            }

            setDeleteError("Erro crítico ao excluir disciplina.");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {errors.root?.message && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-900 text-sm">
                    {errors.root.message}
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="name">Nome da Disciplina *</Label>
                    <Input
                        id="name"
                        {...register("name")}
                        disabled={isSubmitting}
                        aria-invalid={errors.name ? "true" : "false"}
                        className="p-5 rounded-lg bg-background"
                    />
                    {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="code">Código Interno Único *</Label>
                    <Input
                        id="code"
                        {...register("code")}
                        disabled={isSubmitting}
                        aria-invalid={errors.code ? "true" : "false"}
                        className="p-5 rounded-lg bg-background font-mono text-sm"
                    />
                    {errors.code && <p className="text-sm text-red-600">{errors.code.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="basePeriod">Semestre/Período Recomendado*</Label>
                    <Input
                        id="basePeriod"
                        type="number"
                        {...register("basePeriod")}
                        disabled={isSubmitting}
                        className="p-5 rounded-lg bg-background"
                    />
                    {errors.basePeriod && <p className="text-sm text-red-600">{errors.basePeriod.message}</p>}
                </div>

                <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="workload">Carga Horária (h)*</Label>
                    <Input
                        id="workload"
                        type="number"
                        {...register("workload")}
                        disabled={isSubmitting}
                        className="p-5 rounded-lg bg-background sm:w-72"
                    />
                    {errors.workload && <p className="text-sm text-red-600">{errors.workload.message}</p>}
                </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end pt-4 border-t">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={isSubmitting}
                >
                    Cancelar
                </Button>
                <Button className="flex items-center gap-2" type="submit" disabled={!canSubmit}>
                    {isSubmitting && <IconLoader2 className="size-5 animate-spin" />}
                    {isSubmitting ? "Salvando..." : "Salvar Alterações"}
                </Button>
            </div>

            <div className="border border-destructive/25 bg-destructive/5 rounded-2xl p-4 sm:p-5 space-y-4">
                <div>
                    <div className="flex flex-row items-center gap-2">
                        <IconAlertTriangle className="size-5 text-red-600" />
                        <h3 className="text-xl font-semibold text-destructive">Zona de Perigo</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                        Esta ação removerá a disciplina base <b>permanentemente</b>. Essa ação só pode ser concluída se não houver NENHUMA turma no ano letivo já utilizando ela.
                    </p>
                </div>

                <Dialog
                    open={isDeleteModalOpen}
                    onOpenChange={(open) => {
                        setIsDeleteModalOpen(open);
                        if (!open) {
                            setDeleteConfirmationName("");
                            setDeleteError(null);
                        }
                    }}
                >
                    <div className="w-full flex justify-end">
                        <DialogTrigger asChild>
                            <Button type="button" variant="destructive" className="w-full sm:w-auto">
                                Excluir Disciplina
                            </Button>
                        </DialogTrigger>
                    </div>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Excluir Disciplina</DialogTitle>

                            <DialogDescription>
                                Deseja realmente excluir esta disciplina permanentemente?
                            </DialogDescription>
                        </DialogHeader>

                        <div className="flex flex-col items-center">
                            <Image className="w-32 h-32" src={imgGibbyDuvida} alt="Gibby Duvida" width={100} height={100} />
                            <span className="text-center mt-2"> Para confirmar, digite exatamente o nome da disciplina: <br /><strong className="text-foreground">{initialData.name}</strong></span>
                        </div>

                        <div className="space-y-2 mt-2">
                            <Label htmlFor="confirm-delete-subject-name">Confirme o nome</Label>
                            <Input
                                id="confirm-delete-subject-name"
                                value={deleteConfirmationName}
                                onChange={(event) => setDeleteConfirmationName(event.target.value)}
                                placeholder="Digite o nome exato"
                                className="rounded-lg bg-background"
                                disabled={isDeleting}
                            />
                            {deleteError && <p className="text-sm text-red-600">{deleteError}</p>}
                        </div>

                        <DialogFooter className="mt-4">
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
                                onClick={onDeleteSubject}
                                disabled={!canDelete}
                                className="flex items-center gap-2"
                            >
                                {isDeleting && <IconLoader2 className="size-5 animate-spin" />}
                                {isDeleting ? "Excluindo..." : "Excluir Definitivamente"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </form>
    );
}
