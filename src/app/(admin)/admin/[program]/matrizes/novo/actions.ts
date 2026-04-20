"use server";

import { createDegree } from "@/services/degrees/degrees.service";
import { ZodError } from "zod";
import { createDegreeSchema, type CreateDegreeInput } from "./schema";
import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { getProgramBySlug } from "@/services/programs/programs.service";

export async function createDegreeAction(programSlug: string, data: CreateDegreeInput) {
    try {
        const validatedData = createDegreeSchema.parse(data);
        const program = await getProgramBySlug(programSlug);
        
        if (!program) {
            return {
                success: false,
                error: "Programa não encontrado para vincular esta matriz.",
            };
        }

        await createDegree({
            ...validatedData,
            programId: program.id,
        });

        // Invalida a listagem de matrizes daquele programa
        updateTag(`programs:${program.id}:degrees`);
        revalidatePath(`/admin/${programSlug}/matrizes`);
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
            error: "Erro ao criar matriz curricular",
        };
    }

    const params = new URLSearchParams({
        toast: "success",
        message: "Matriz curricular criada com sucesso",
    });

    redirect(`/admin/${programSlug}/matrizes?${params.toString()}`);
}
