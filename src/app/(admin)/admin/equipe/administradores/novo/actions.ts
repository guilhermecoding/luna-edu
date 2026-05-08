"use server";

import { createAdmin, promoteUserToAdmin } from "@/services/users/admins.service";
import { revalidatePath, updateTag } from "next/cache";
import { ZodError } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { createAdminSchema, promoteTeacherSchema, type CreateAdminInput, type PromoteTeacherInput } from "./schema";

export async function createAdminAction(data: CreateAdminInput) {
    try {
        const validatedData = createAdminSchema.parse(data);
        await createAdmin(validatedData);

        updateTag("admins-list");
        updateTag("users-list");
        updateTag("users-stats");
        updateTag("all-teachers");
        revalidatePath("/admin/equipe/administradores");
        revalidatePath("/admin/equipe");
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
            error: "Erro ao criar administrador",
        };
    }

    const params = new URLSearchParams({
        toast: "success",
        message: "Administrador criado com sucesso",
    });

    return {
        success: true,
        redirectTo: `/admin/equipe/administradores?${params.toString()}`,
    };
}

export async function promoteTeacherAction(data: PromoteTeacherInput) {
    try {
        const validatedData = promoteTeacherSchema.parse(data);
        await promoteUserToAdmin(validatedData.teacherId, validatedData.systemRole);

        updateTag("admins-list");
        updateTag("users-list");
        updateTag("users-stats");
        updateTag("all-teachers");
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

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2002") {
                const target = (error.meta?.target as string[]) || [];
                if (target.includes("cpf")) return { success: false, error: "Já existe um usuário com este CPF." };
                if (target.includes("email")) return { success: false, error: "Já existe um usuário com este e-mail." };
            }
        }

        if (error instanceof Error) {
            return {
                success: false,
                error: "Erro do banco de dados: " + (error.message.split("\n").pop() || error.message),
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

    return {
        success: true,
        redirectTo: `/admin/equipe/administradores?${params.toString()}`,
    };
}
