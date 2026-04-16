"use server";

import { createSubject } from "@/services/subjects/subjects.service";
import { ZodError } from "zod";
import { createSubjectSchema, type CreateSubjectInput } from "./schema";
import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { getDegreeBySlug } from "@/services/degrees/degrees.service";

export async function createSubjectAction(programSlug: string, degreeSlug: string, data: CreateSubjectInput) {
    try {
        const validatedData = createSubjectSchema.parse(data);
        const degree = await getDegreeBySlug(programSlug, degreeSlug);
        
        if (!degree) {
            return {
                success: false,
                error: "Matriz curricular não encontrada.",
            };
        }

        await createSubject({
            ...validatedData,
            degreeId: degree.id,
        });

        updateTag(`degree:${degree.id}:subjects`);
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
            error: "Erro ao criar disciplina",
        };
    }

    const params = new URLSearchParams({
        toast: "success",
        message: "Disciplina adicionada com sucesso",
    });

    redirect(`/admin/${programSlug}/matrizes/${degreeSlug}?${params.toString()}`);
}
