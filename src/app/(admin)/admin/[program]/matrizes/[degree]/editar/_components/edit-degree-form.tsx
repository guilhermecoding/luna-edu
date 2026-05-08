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
import { deleteDegreeAction, editDegreeAction } from "../actions";
import { createDegreeSchema } from "../../../novo/schema";
import { IconAlertTriangle, IconLoader2 } from "@tabler/icons-react";
import Image from "next/image";
import imgGibbyDuvida from "@/assets/images/logo-gibby-duvida.svg";
import { Degree } from "@/generated/prisma/client";

// Omitimos o programId na edição do form client pois não alteramos os vínculos base lá
const editDegreeSchema = createDegreeSchema.omit({ slug: true });
type FormInput = z.input<typeof editDegreeSchema>;
type FormOutput = z.output<typeof editDegreeSchema>;

type Props = {
    programSlug: string;
    degreeId: string;
    degreeSlug: string;
    initialData: Degree;
};

export function EditDegreeForm({ programSlug, degreeId, degreeSlug, initialData }: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteConfirmationName, setDeleteConfirmationName] = useState("");
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const form = useForm<FormInput, undefined, FormOutput>({
        resolver: zodResolver(editDegreeSchema),
        mode: "onChange",
        defaultValues: {
            name: initialData.name,
            description: initialData.description || "",
            modality: initialData.modality || "",
            level: initialData.level || "",
            totalHours: initialData.totalHours || undefined,
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
            const result = await editDegreeAction(degreeId, programSlug, degreeSlug, data);
            if (result?.success === false) {
                const params = new URLSearchParams(searchParams.toString());
                params.set("toast", "error");
                params.set("message", result.error || "Erro ao editar matriz");
                router.replace(`${pathname}?${params.toString()}`, { scroll: false });

                setError("root", {
                    type: "server",
                    message: result.error || "Erro ao editar matriz",
                });
                return;
            }

            if (result?.success && result.redirectTo) {
                router.push(result.redirectTo);
                router.refresh();
                return;
            }
        } catch (error) {
            const params = new URLSearchParams(searchParams.toString());
            params.set("toast", "error");
            params.set("message", "Erro fatal ao editar matriz");
            router.replace(`${pathname}?${params.toString()}`, { scroll: false });

            setError("root", {
                type: "server",
                message: "Erro fatal ao editar matriz",
            });
        }
    };

    const onDeleteDegree = async () => {
        setDeleteError(null);
        setIsDeleting(true);

        try {
            const result = await deleteDegreeAction(degreeId, programSlug);
            if (result?.success === false) {
                const params = new URLSearchParams(searchParams.toString());
                params.set("toast", "error");
                params.set("message", result.error || "Erro ao excluir matriz");
                router.replace(`${pathname}?${params.toString()}`, { scroll: false });

                setDeleteError(result.error || "Erro ao excluir matriz");
                return;
            }

            if (result?.success && result.redirectTo) {
                router.push(result.redirectTo);
                router.refresh();
                return;
            }
        } catch (error) {
            setDeleteError("Erro crítico ao excluir matriz.");
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
                    <Label htmlFor="name">Nome do Curso/Matriz *</Label>
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
                    <Label htmlFor="modality">Modalidade</Label>
                    <Input
                        id="modality"
                        {...register("modality")}
                        disabled={isSubmitting}
                        className="p-5 rounded-lg bg-background"
                    />
                    {errors.modality && <p className="text-sm text-red-600">{errors.modality.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="level">Nível</Label>
                    <Input
                        id="level"
                        {...register("level")}
                        disabled={isSubmitting}
                        className="p-5 rounded-lg bg-background"
                    />
                    {errors.level && <p className="text-sm text-red-600">{errors.level.message}</p>}
                </div>

                <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="totalHours">Carga Horária Total (h)</Label>
                    <Input
                        id="totalHours"
                        type="number"
                        {...register("totalHours")}
                        disabled={isSubmitting}
                        className="p-5 rounded-lg bg-background sm:w-72"
                    />
                    {errors.totalHours && <p className="text-sm text-red-600">{errors.totalHours.message}</p>}
                </div>

                <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="description">Descrição</Label>
                    <textarea
                        id="description"
                        {...register("description")}
                        disabled={isSubmitting}
                        className="w-full p-5 border border-input bg-background rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        rows={4}
                    />
                    {errors.description && <p className="text-sm text-red-600">{errors.description.message}</p>}
                </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end pt-4">
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
                        Esta ação removerá a matriz curricular <b>permanentemente</b>. Essa ação só pode ser concluída se não houver disciplinas preenchidas dentro dela.
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
                                Excluir Matriz
                            </Button>
                        </DialogTrigger>
                    </div>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Excluir Matriz Curricular</DialogTitle>

                            <DialogDescription>
                                Deseja realmente excluir esta matriz permanentemente?
                            </DialogDescription>
                        </DialogHeader>

                        <div className="flex flex-col items-center">
                            <Image className="w-32 h-32" src={imgGibbyDuvida} alt="Gibby Duvida" width={100} height={100} />
                            <span className="text-center mt-2"> Para confirmar, digite exatamente o nome da matriz: <br/><strong className="text-foreground">{initialData.name}</strong></span>
                        </div>

                        <div className="space-y-2 mt-2">
                            <Label htmlFor="confirm-delete-name">Confirme o nome</Label>
                            <Input
                                id="confirm-delete-name"
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
                                onClick={onDeleteDegree}
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
