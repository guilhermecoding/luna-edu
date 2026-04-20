"use server";

import { deleteSubject, updateSubject } from "@/services/subjects/subjects.service";
import { ZodError } from "zod";
import { createSubjectSchema } from "../../novo/schema";
import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import z from "zod";

const editSubjectSchema = createSubjectSchema;
export type EditSubjectInput = z.infer<typeof editSubjectSchema>;

export async function editSubjectAction(subjectId: string, programSlug: string, degreeSlug: string, degreeId: string, data: EditSubjectInput) {
    try {
        const validatedData = editSubjectSchema.parse(data);

        await updateSubject(subjectId, {
            name: validatedData.name,
            code: validatedData.code,
            workload: validatedData.workload,
            basePeriod: validatedData.basePeriod,
        });

        // Invalida cache de subjects e da disciplina especifica
        updateTag(`degree:${degreeId}:subjects`);
        updateTag(`subject:${subjectId}`);
        updateTag(`program:${programSlug}:subjects`);
        revalidatePath(`/admin/${programSlug}/matrizes/${degreeSlug}`);
    } catch (error) {
        if (error instanceof ZodError) {
            return {
                success: false,
                error: error.issues[0]?.message || "Erro de validação",
            };
        }

        if (error instanceof Error) {
            return {
                success: false,
                error: error.message,
            };
        }

        return {
            success: false,
            error: "Erro ao editar disciplina",
        };
    }

    const params = new URLSearchParams({
        toast: "success",
        message: "Disciplina atualizada com sucesso",
    });

    redirect(`/admin/${programSlug}/matrizes/${degreeSlug}?${params.toString()}`);
}

export async function deleteSubjectAction(subjectId: string, programSlug: string, degreeSlug: string, degreeId: string) {
    try {
        await deleteSubject(subjectId);

        // Invalida cache da matriz q possui as materias
        updateTag(`degree:${degreeId}:subjects`);
        updateTag(`program:${programSlug}:subjects`);
    } catch (error) {
        if (error instanceof Error) {
            return {
                success: false,
                error: error.message,
            };
        }

        return {
            success: false,
            error: "Erro desconhecido ao excluir disciplina base.",
        };
    }

    const params = new URLSearchParams({
        toast: "success",
        message: "Disciplina excluída com sucesso",
    });

    redirect(`/admin/${programSlug}/matrizes/${degreeSlug}?${params.toString()}`);
}
