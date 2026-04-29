"use server";

import { updateUser } from "@/services/users/users.service";
import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { ZodError } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { editMemberSchema, type EditMemberInput } from "./schema";
import { unmask } from "@/lib/masks";
import { auth } from "@/lib/auth";

export async function editMemberAction(memberId: string, data: EditMemberInput) {
    try {
        const validatedData = editMemberSchema.parse(data);
        const cleanData = {
            ...validatedData,
            cpf: unmask(validatedData.cpf),
            phone: unmask(validatedData.phone),
        };

        const { password, confirmPassword, ...updateFields } = cleanData;
        void confirmPassword;
        await updateUser(memberId, updateFields);

        if (password) {
            await auth.api.setUserPassword({
                body: {
                    userId: memberId,
                    newPassword: password,
                },
                headers: await headers(),
            });
        }

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
            const normalizedMessage = error.message
                .split("\n")
                .map((line) => line.trim())
                .filter(Boolean)
                .join(" | ");

            return {
                success: false,
                error: "Erro do banco de dados: " + (normalizedMessage || error.message || "Falha desconhecida"),
            };
        }

        if (typeof error === "object" && error !== null) {
            const possibleMessage = Reflect.get(error, "message");
            const possibleCode = Reflect.get(error, "code");

            return {
                success: false,
                error: `Erro do banco de dados: ${String(possibleMessage || possibleCode || JSON.stringify(error))}`,
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
