"use server";

import { updateCampus, deleteCampus, getCampusSlugById } from "@/services/campuses/campuses.service";
import { ZodError } from "zod";
import { editCampusSchema, type EditCampusInput } from "./schema";
import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";

export async function editCampusAction(id: string, data: EditCampusInput) {
    try {
        const validatedData = editCampusSchema.parse(data);
        await updateCampus(id, validatedData);

        updateTag("campuses:list");
        const slug = await getCampusSlugById(id);
        if (slug) {
            updateTag(`campus:${slug}`);
        }
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
