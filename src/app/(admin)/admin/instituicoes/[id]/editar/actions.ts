"use server";

import { updateCampus, deleteCampus } from "@/services/campuses/campuses.service";
import { ZodError } from "zod";
import { createCampusSchema, type CreateCampusInput } from "../../novo/schema";
import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";

export async function editCampusAction(id: string, data: CreateCampusInput) {
    try {
        const validatedData = createCampusSchema.parse(data);
        await updateCampus(id, validatedData);

        updateTag("campuses:list");
        updateTag(`campus:${id}`);
        revalidatePath("/admin/instituicoes");
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
            error: "Erro ao editar instituição",
        };
    }

    const params = new URLSearchParams({
        toast: "success",
        message: "Instituição atualizada com sucesso",
    });

    redirect(`/admin/instituicoes?${params.toString()}`);
}

export async function deleteCampusAction(id: string) {
    try {
        await deleteCampus(id);

        updateTag("campuses:list");
        revalidatePath("/admin/instituicoes");
    } catch (error) {
        if (error instanceof Error) {
            return {
                success: false,
                error: error.message,
            };
        }

        return {
            success: false,
            error: "Erro ao excluir instituição",
        };
    }

    const params = new URLSearchParams({
        toast: "success",
        message: "Instituição excluída com sucesso",
    });

    redirect(`/admin/instituicoes?${params.toString()}`);
}
