"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { IconAlertTriangle, IconLoader2 } from "@tabler/icons-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, type SubmitHandler, useForm } from "react-hook-form";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Shift } from "@/generated/prisma/client";
import { isRedirectError } from "@/lib/is-redirect-error";
import { shiftLabels } from "../../../../../schema";
import {
    deleteClassGroupCourseAction,
    editClassGroupCourseAction,
} from "../actions";
import {
    editClassGroupCourseSchema,
    type EditClassGroupCourseInput,
} from "../schema";

type SubjectOption = {
    id: string;
    name: string;
    code: string;
};

type EditClassGroupSubjectFormProps = {
    programSlug: string;
    periodSlug: string;
    classGroupSlug: string;
    courseCode: string;
    defaultValues: {
        name: string;
        code: string;
        subjectId: string;
        shift: Shift;
    };
    subjects: SubjectOption[];
};

export function EditClassGroupSubjectForm({
    programSlug,
    periodSlug,
    classGroupSlug,
    courseCode,
    defaultValues,
    subjects,
}: EditClassGroupSubjectFormProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteConfirmationName, setDeleteConfirmationName] = useState("");
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const form = useForm<EditClassGroupCourseInput>({
        resolver: zodResolver(editClassGroupCourseSchema),
        mode: "onChange",
        defaultValues: {
            name: defaultValues.name,
            subjectId: defaultValues.subjectId,
            shift: defaultValues.shift,
        },
    });

    const {
        control,
        register,
        formState: { errors, isSubmitting, isValid },
        setError,
        clearErrors,
        reset,
    } = form;

    const canSubmit = isValid && !isSubmitting;
    const canDelete = deleteConfirmationName === defaultValues.name && !isDeleting;

    useEffect(() => {
        clearErrors();

        return () => {
            reset({
                name: defaultValues.name,
                subjectId: defaultValues.subjectId,
                shift: defaultValues.shift,
            });
        };
    }, [clearErrors, defaultValues.name, defaultValues.shift, defaultValues.subjectId, reset]);

    const onSubmit: SubmitHandler<EditClassGroupCourseInput> = async (data) => {
        clearErrors("root");

        try {
            const result = await editClassGroupCourseAction(
                programSlug,
                periodSlug,
                classGroupSlug,
                courseCode,
                data,
            );

            if (result?.success === false) {
                const params = new URLSearchParams(searchParams.toString());
                params.set("toast", "error");
                params.set("message", result.error || "Erro ao atualizar disciplina");
                router.replace(`${pathname}?${params.toString()}`, { scroll: false });

                setError("root", {
                    type: "server",
                    message: result.error || "Erro ao atualizar disciplina",
                });
            }
        } catch (error) {
            if (isRedirectError(error)) {
                throw error;
            }

            const params = new URLSearchParams(searchParams.toString());
            params.set("toast", "error");
            params.set("message", "Erro ao atualizar disciplina");
            router.replace(`${pathname}?${params.toString()}`, { scroll: false });

            setError("root", {
                type: "server",
                message: "Erro ao atualizar disciplina",
            });
        }
    };

    const onDeleteCourse = async () => {
        setDeleteError(null);
        setIsDeleting(true);

        try {
            const result = await deleteClassGroupCourseAction(
                programSlug,
                periodSlug,
                classGroupSlug,
                courseCode,
                deleteConfirmationName,
            );

            if (result?.success === false) {
                const params = new URLSearchParams(searchParams.toString());
                params.set("toast", "error");
                params.set("message", result.error || "Erro ao apagar disciplina");
                router.replace(`${pathname}?${params.toString()}`, { scroll: false });
                setDeleteError(result.error || "Erro ao apagar disciplina");
            }
        } catch (error) {
            if (isRedirectError(error)) {
                throw error;
            }

            const params = new URLSearchParams(searchParams.toString());
            params.set("toast", "error");
            params.set("message", "Erro ao apagar disciplina");
            router.replace(`${pathname}?${params.toString()}`, { scroll: false });
            setDeleteError("Erro ao apagar disciplina");
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

            <div className="space-y-2">
                <Label htmlFor="name">Nome da Disciplina na Turma *</Label>
                <Input
                    id="name"
                    placeholder="Ex: Matemática"
                    {...register("name")}
                    disabled={isSubmitting}
                    aria-invalid={errors.name ? "true" : "false"}
                    className="p-5 rounded-lg bg-background"
                />
                {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="subjectId">Disciplina Curricular *</Label>
                <Controller
                    control={control}
                    name="subjectId"
                    render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange} disabled={isSubmitting}>
                            <SelectTrigger id="subjectId" className="p-5 rounded-lg bg-background w-full">
                                <SelectValue placeholder="Selecione uma disciplina" />
                            </SelectTrigger>
                            <SelectContent>
                                {subjects.map((subject) => (
                                    <SelectItem key={subject.id} value={subject.id}>
                                        {subject.name} ({subject.code})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                />
                {errors.subjectId && <p className="text-sm text-red-600">{errors.subjectId.message}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="shift">Turno *</Label>
                <Controller
                    control={control}
                    name="shift"
                    render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange} disabled={isSubmitting}>
                            <SelectTrigger id="shift" className="p-5 rounded-lg bg-background w-full">
                                <SelectValue placeholder="Selecione o turno" />
                            </SelectTrigger>
                            <SelectContent>
                                {(Object.keys(shiftLabels) as Shift[]).map((shift) => (
                                    <SelectItem key={shift} value={shift}>
                                        {shiftLabels[shift]}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                />
                {errors.shift && <p className="text-sm text-red-600">{errors.shift.message}</p>}
            </div>

            <div className="space-y-2 cursor-not-allowed!">
                <Label htmlFor="code">Código da Disciplina</Label>
                <Input
                    id="code"
                    value={defaultValues.code}
                    disabled
                    readOnly
                    className="w-full p-5 rounded-lg bg-muted text-muted-foreground uppercase"
                />
                <p className="text-xs text-muted-foreground">
                    O código não pode ser alterado.
                </p>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end pt-4">
                <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
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
                        Esta ação remove a disciplina ofertada <b>permanentemente</b> e não pode ser desfeita.
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
                                Apagar Disciplina
                            </Button>
                        </DialogTrigger>
                    </div>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Apagar Disciplina</DialogTitle>
                            <DialogDescription>
                                Para confirmar, digite exatamente o nome da disciplina.
                            </DialogDescription>
                        </DialogHeader>

                        <p className="text-sm">
                            Nome esperado: <strong>{defaultValues.name}</strong>
                        </p>

                        <div className="space-y-2">
                            <Label htmlFor="confirm-delete-course-name">Nome da disciplina</Label>
                            <Input
                                id="confirm-delete-course-name"
                                value={deleteConfirmationName}
                                onChange={(event) => setDeleteConfirmationName(event.target.value)}
                                placeholder="Digite o nome exato para confirmar"
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
                                onClick={onDeleteCourse}
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
    );
}
