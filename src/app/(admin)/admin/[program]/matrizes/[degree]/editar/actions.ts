"use server";

import { deleteDegree, updateDegree } from "@/services/degrees/degrees.service";
import { ZodError } from "zod";
import { type CreateDegreeInput } from "../../novo/schema";
import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";

// Reaproveitamos o input tirando o slug (pois a acao usa ID para update e preserva slug)
export type EditDegreeInput = Omit<CreateDegreeInput, "slug" | "programId">;

export async function editDegreeAction(id: string, programSlug: string, degreeSlug: string, data: EditDegreeInput) {
    try {
        await updateDegree(id, {
            name: data.name,
            description: data.description,
            modality: data.modality,
            level: data.level,
            totalHours: data.totalHours,
        });

        updateTag(`degree:${programSlug}:${degreeSlug}`);
        // Também devemos invalidar a lista
        revalidatePath(`/admin/${programSlug}/matrizes`);
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
            error: "Erro ao editar matriz curricular",
        };
    }

    const params = new URLSearchParams({
        toast: "success",
        message: "Matriz curricular atualizada com sucesso",
    });

    redirect(`/admin/${programSlug}/matrizes?${params.toString()}`);
}

export async function deleteDegreeAction(id: string, programSlug: string) {
    try {
        await deleteDegree(id);

        // Invalida a listagem do programa
        updateTag(`programs:${programSlug}:degrees`);
    } catch (error) {
        if (error instanceof Error) {
            return {
                success: false,
                error: error.message,
            };
        }

        return {
            success: false,
            error: "Erro desconhecido ao excluir matriz.",
        };
    }

    const params = new URLSearchParams({
        toast: "success",
        message: "Matriz curricular excluída com sucesso",
    });

    redirect(`/admin/${programSlug}/matrizes?${params.toString()}`);
}
