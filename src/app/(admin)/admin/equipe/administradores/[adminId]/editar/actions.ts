"use server";

import { updateAdmin } from "@/services/users/admins.service";
import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { ZodError } from "zod";
import { Prisma } from "@/generated/prisma/client";
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

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2002") {
                const target = (error.meta?.target as string[]) || [];
                if (target.includes("cpf")) return { success: false, error: "Já existe um usuário com este CPF." };
                if (target.includes("email")) return { success: false, error: "Já existe um usuário com este e-mail." };
            }
        }

        if (error instanceof Error) {
            if (error.message === "CPF_ALREADY_EXISTS") {
                return { success: false, error: "Já existe um usuário cadastrado com este CPF." };
            }
            if (error.message.includes("User already exists") || (error.message.includes("Unique constraint failed") && error.message.includes("email"))) {
                return { success: false, error: "Já existe um usuário com este e-mail." };
            }
            if (error.message.includes("Unique constraint failed") && error.message.includes("cpf")) {
                return { success: false, error: "Já existe um usuário com este CPF." };
            }
            return {
                success: false,
                error: "Erro do banco de dados: " + (error.message.split("\n").pop() || error.message),
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
