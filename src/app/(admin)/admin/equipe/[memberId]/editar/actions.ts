"use server";

import { updateUser } from "@/services/users/users.service";
import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { ZodError } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { editMemberSchema, type EditMemberInput } from "./schema";

export async function editMemberAction(memberId: string, data: EditMemberInput) {
    try {
        const validatedData = editMemberSchema.parse(data);
        await updateUser(memberId, validatedData);

        updateTag("admins-list");
        updateTag("users-list");
        updateTag("users-stats");
        updateTag(`user-${memberId}`);
        updateTag(`admin-${memberId}`);
        revalidatePath("/admin/equipe");
        revalidatePath("/admin/equipe/administradores");
        revalidatePath("/admin/equipe/professores");
        revalidatePath(`/admin/equipe/${memberId}/editar`);
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
            error: "Erro ao atualizar membro",
        };
    }

    const params = new URLSearchParams({
        toast: "success",
        message: "Membro atualizado com sucesso",
    });

    redirect(`/admin/equipe?${params.toString()}`);
}
