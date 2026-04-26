"use server";

import { updateAdmin } from "@/services/users/admins.service";
import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { ZodError } from "zod";
import { editAdminSchema, type EditAdminInput } from "./schema";

export async function editAdminAction(adminId: string, data: EditAdminInput) {
    try {
        const validatedData = editAdminSchema.parse(data);
        await updateAdmin(adminId, validatedData);

        updateTag("admins-list");
        updateTag("users-list");
        updateTag(`admin-${adminId}`);
        revalidatePath("/admin/equipe/administradores");
        revalidatePath(`/admin/equipe/administradores/${adminId}/editar`);
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
            error: "Erro ao atualizar administrador",
        };
    }

    const params = new URLSearchParams({
        toast: "success",
        message: "Administrador atualizado com sucesso",
    });

    redirect(`/admin/equipe/administradores?${params.toString()}`);
}
