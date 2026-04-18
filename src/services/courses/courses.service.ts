import { Course, Prisma, Shift } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";
import { cacheLife, cacheTag } from "next/cache";

/**
 * Lista todas as turmas de um período específico.
 * Inclui dados da disciplina e da sala para exibição na listagem.
 */
export async function getCoursesByPeriodId(periodId: string) {
    "use cache";
    cacheLife("max");
    cacheTag(`period:${periodId}:courses`);

    return await prisma.course.findMany({
        where: {
            periodId,
        },
        include: {
            subject: true,
            room: {
                include: {
                    campus: true,
                },
            },
        },
        orderBy: [
            { name: "asc" },
            { createdAt: "desc" },
        ],
    });
}

/**
 * Busca uma turma específica pelo código.
 */
export async function getCourseByCode(code: string) {
    "use cache";
    cacheLife("max");
    cacheTag(`course:${code}`);

    return await prisma.course.findUnique({
        where: {
            code,
        },
        include: {
            subject: true,
            room: {
                include: {
                    campus: true,
                },
            },
            period: true,
        },
    });
}

/**
 * Cria uma nova turma.
 */
export async function createCourse(data: {
    name: string;
    periodId: string;
    subjectId: string;
    roomId?: string | null;
    shift: Shift;
}): Promise<Course> {
    try {
        const course = await prisma.course.create({
            data: {
                name: data.name,
                periodId: data.periodId,
                subjectId: data.subjectId,
                roomId: data.roomId || null,
                shift: data.shift,
            },
        });
        return course;
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
            throw new Error("Já existe uma turma com este código.");
        }
        throw error;
    }
}

/**
 * Atualiza os dados de uma turma.
 */
export async function updateCourse(
    id: string,
    data: {
        name: string;
        subjectId: string;
        roomId?: string | null;
        shift: Shift;
    },
): Promise<Course> {
    try {
        const course = await prisma.course.update({
            where: {
                id,
            },
            data: {
                name: data.name,
                subjectId: data.subjectId,
                roomId: data.roomId || null,
                shift: data.shift,
            },
        });
        return course;
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2025") {
                throw new Error("Turma não encontrada.");
            }
        }
        throw error;
    }
}

/**
 * Deleta uma turma.
 */
export async function deleteCourse(id: string): Promise<Course> {
    try {
        const course = await prisma.course.delete({
            where: {
                id,
            },
        });
        return course;
    } catch (error) {
        const msg = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
        if ((error as { code?: string })?.code === "P2003" || msg.includes("foreign key constraint") || msg.includes("violates restrict")) {
            throw new Error("Não é possível excluir a turma porque existem matrículas, aulas ou atividades vinculadas a ela.");
        }
        if (error instanceof Error && error.message.includes("Record to delete does not exist")) {
            throw new Error("Turma não encontrada.");
        }
        throw error;
    }
}
