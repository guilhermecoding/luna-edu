"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createStudentSchema, editStudentSchema, type CreateStudentData, type EditStudentData } from "./schema";
import { createStudent, updateStudent } from "@/services/students/students.service";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Prisma } from "@/generated/prisma/client";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export async function createStudentAction(data: CreateStudentData) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        const actorId = session?.user?.id;

        if (!actorId) {
            return { success: false, error: "Não autorizado" };
        }

        const parsedData = createStudentSchema.parse(data);

        await createStudent({
            name: parsedData.name,
            email: parsedData.email,
            cpf: parsedData.cpf,
            studentPhone: parsedData.studentPhone,
            parentPhone: parsedData.parentPhone || null,
            birthDate: parsedData.birthDate,
            genre: parsedData.genre,
            school: parsedData.school,
        });

        revalidateTag("students-list");
        revalidateTag("students-count");
        
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2002") {
                const target = error.meta?.target as string[];
                if (target?.includes("email")) {
                    return { success: false, error: "Este e-mail já está em uso por outro aluno." };
                }
                if (target?.includes("cpf")) {
                    return { success: false, error: "Este CPF já está em uso por outro aluno." };
                }
            }
        }
        if (isRedirectError(error)) throw error;
        
        console.error("Erro ao criar aluno:", error);
        return { success: false, error: "Ocorreu um erro inesperado ao criar o aluno." };
    }

    revalidatePath("/admin/alunos");
    redirect("/admin/alunos");
}

export async function editStudentAction(id: string, data: EditStudentData) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        const actorId = session?.user?.id;

        if (!actorId) {
            return { success: false, error: "Não autorizado" };
        }

        const parsedData = editStudentSchema.parse(data);

        await updateStudent(id, {
            name: parsedData.name,
            email: parsedData.email,
            cpf: parsedData.cpf,
            studentPhone: parsedData.studentPhone,
            parentPhone: parsedData.parentPhone || null,
            birthDate: parsedData.birthDate,
            genre: parsedData.genre,
            school: parsedData.school,
        });

        revalidateTag("students-list");
        revalidateTag(`student-${id}`);

    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2002") {
                const target = error.meta?.target as string[];
                if (target?.includes("email")) {
                    return { success: false, error: "Este e-mail já está em uso por outro aluno." };
                }
                if (target?.includes("cpf")) {
                    return { success: false, error: "Este CPF já está em uso por outro aluno." };
                }
                if (target?.includes("luna_id") || target?.includes("lunaId")) {
                    return { success: false, error: "Esta Matrícula já está em uso por outro aluno." };
                }
            }
        }
        if (isRedirectError(error)) throw error;
        
        console.error("Erro ao editar aluno:", error);
        return { success: false, error: "Ocorreu um erro inesperado ao atualizar o aluno." };
    }

    revalidatePath("/admin/alunos");
    redirect("/admin/alunos");
}

export async function deleteStudentAction(studentId: string, adminPasswordConfirm: string) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        const actorId = session?.user?.id;

        if (!actorId) {
            return { success: false, error: "Não autorizado" };
        }

        // Verify password
        const adminAccount = await prisma.account.findFirst({
            where: { userId: actorId, providerId: "credential" },
        });

        if (!adminAccount?.password) {
            return { success: false, error: "Não foi possível verificar a senha do administrador." };
        }

        const { verifyPassword } = await import("better-auth/crypto");
        const isPasswordValid = await verifyPassword({
            hash: adminAccount.password,
            password: adminPasswordConfirm,
        });

        if (!isPasswordValid) {
            return { success: false, error: "Senha incorreta." };
        }

        const { deleteStudent } = await import("@/services/students/students.service");
        await deleteStudent(studentId);

        revalidateTag("students-list");
        revalidateTag("students-count");
        revalidateTag(`student-${studentId}`);
        revalidatePath("/admin/alunos");

        return { success: true };
    } catch (error) {
        if (isRedirectError(error)) throw error;
        console.error("Erro fatal ao excluir aluno:", error);
        return { success: false, error: "Erro fatal ao excluir aluno." };
    }
}
