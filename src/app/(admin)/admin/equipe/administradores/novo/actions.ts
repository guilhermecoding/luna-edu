"use server";

import { createAdmin, promoteUserToAdmin } from "@/services/users/admins.service";
import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { ZodError } from "zod";
import { createAdminSchema, promoteTeacherSchema, type CreateAdminInput, type PromoteTeacherInput } from "./schema";

export async function createAdminAction(data: CreateAdminInput) {
    try {
        const validatedData = createAdminSchema.parse(data);
        await createAdmin(validatedData);

        updateTag("admins-list");
        updateTag("users-list");
        updateTag("users-stats");
        revalidatePath("/admin/equipe/administradores");
        revalidatePath("/admin/equipe");
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
            error: "Erro ao criar administrador",
        };
    }

    const params = new URLSearchParams({
        toast: "success",
        message: "Administrador criado com sucesso",
    });

    redirect(`/admin/equipe/administradores?${params.toString()}`);
}

export async function promoteTeacherAction(data: PromoteTeacherInput) {
    try {
        const validatedData = promoteTeacherSchema.parse(data);
        await promoteUserToAdmin(validatedData.teacherId, validatedData.systemRole);

        updateTag("admins-list");
        updateTag("users-list");
        updateTag("users-stats");
        updateTag(`admin-${validatedData.teacherId}`);
        revalidatePath("/admin/equipe/administradores");
        revalidatePath("/admin/equipe");
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
            error: "Erro ao promover professor a administrador",
        };
    }

    const params = new URLSearchParams({
        toast: "success",
        message: "Professor adicionado como administrador com sucesso",
    });

    redirect(`/admin/equipe/administradores?${params.toString()}`);
}
