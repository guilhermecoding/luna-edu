"use server";

import { createTeacher, promoteUserToTeacher } from "@/services/users/teachers.service";
import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { ZodError } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { createTeacherSchema, promoteAdminSchema, type CreateTeacherInput, type PromoteAdminInput } from "./schema";

export async function createTeacherAction(data: CreateTeacherInput) {
    try {
        const validatedData = createTeacherSchema.parse(data);
        await createTeacher(validatedData);

        updateTag("teachers-list");
        updateTag("users-list");
        updateTag("users-stats");
        revalidatePath("/admin/equipe/professores");
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
            error: "Erro ao criar professor",
        };
    }

    const params = new URLSearchParams({
        toast: "success",
        message: "Professor criado com sucesso",
    });

    redirect(`/admin/equipe/professores?${params.toString()}`);
}

export async function promoteAdminAction(data: PromoteAdminInput) {
    try {
        const validatedData = promoteAdminSchema.parse(data);
        await promoteUserToTeacher(validatedData.adminId, validatedData.systemRole);

        updateTag("teachers-list");
        updateTag("users-list");
        updateTag("users-stats");
        updateTag(`user-${validatedData.adminId}`);
        revalidatePath("/admin/equipe/professores");
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
            error: "Erro ao adicionar administrador como professor",
        };
    }

    const params = new URLSearchParams({
        toast: "success",
        message: "Administrador adicionado como professor com sucesso",
    });

    redirect(`/admin/equipe/professores?${params.toString()}`);
}
