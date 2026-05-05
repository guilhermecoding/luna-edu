import prisma from "@/lib/prisma";
import { cacheLife, cacheTag } from "next/cache";

/**
 * Retorna a quantidade de alunos únicos matriculados nas disciplinas de uma turma física (ClassGroup).
 */
export async function getStudentCountByClassGroupId(classGroupId: string): Promise<number> {
    "use cache";
    cacheLife("weeks");
    cacheTag(`class-group:${classGroupId}:students-count`);

    return await prisma.student.count({
        where: {
            enrollments: {
                some: {
                    course: {
                        classGroupId: classGroupId,
                    },
                },
            },
        },
    });
}

/**
 * Retorna a quantidade total de alunos no sistema.
 */
export async function getTotalStudentsCount(): Promise<number> {
    "use cache";
    cacheLife("days");
    cacheTag("students-count");

    return await prisma.student.count();
}

/**
 * Retorna a lista de alunos do sistema, com opção de filtro pelo nome ou CPF.
 */
export async function getStudentsList(query?: string) {
    "use cache";
    cacheLife("minutes");
    cacheTag("students-list");

    return await prisma.student.findMany({
        where: query ? {
            OR: [
                {
                    name: {
                        contains: query,
                        mode: "insensitive" as const,
                    },
                },
                {
                    cpf: {
                        contains: query.replace(/\D/g, ""),
                    },
                },
            ],
        } : {},
        select: {
            id: true,
            lunaId: true,
            name: true,
            email: true,
            cpf: true,
            studentPhone: true,
            birthDate: true,
            genre: true,
            school: true,
        },
        orderBy: {
            name: "asc",
        },
    });
}

export type StudentListItem = Awaited<ReturnType<typeof getStudentsList>>[number];

/**
 * Retorna um aluno pelo ID
 */
export async function getStudentById(id: string) {
    "use cache";
    cacheLife("minutes");
    cacheTag(`student-${id}`);

    return await prisma.student.findUnique({
        where: { id },
    });
}

/**
 * Cria um novo aluno com LUNA ID gerado automaticamente.
 */
export async function createStudent(data: Omit<Parameters<typeof prisma.student.create>[0]["data"], "id" | "createdAt" | "lunaId">) {
    const { generateLunaId } = await import("@/lib/generate-luna-id");
    const lunaId = await generateLunaId();
    
    return await prisma.student.create({
        data: {
            ...data,
            lunaId,
        },
    });
}

/**
 * Atualiza um aluno existente
 */
export async function updateStudent(id: string, data: Partial<Parameters<typeof prisma.student.update>[0]["data"]>) {
    return await prisma.student.update({
        where: { id },
        data,
    });
}

