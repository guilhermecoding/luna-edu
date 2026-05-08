import { Degree } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";
import { cacheLife, cacheTag } from "next/cache";

/**
 * Lista todas as matrizes (Degrees) de um programa específico.
 *
 * @param programId ID do programa pai.
 * @returns Lista de matrizes curriculares.
 */
export async function getDegreesByProgramId(programId: string): Promise<Degree[]> {
    "use cache";
    cacheLife("max");
    cacheTag(`programs:${programId}:degrees`);

    return await prisma.degree.findMany({
        where: {
            programId,
        },
        orderBy: {
            name: "asc",
        },
    });
}

/**
 * Busca uma matriz (Degree) pelo slug, dentro de um programa.
 *
 * @param programSlug Slug do programa pai.
 * @param slug Slug único da matriz.
 * @returns A matriz encontrada ou null.
 */
export async function getDegreeBySlug(programSlug: string, slug: string) {
    return await prisma.degree.findFirst({
        where: {
            slug,
            program: {
                slug: programSlug,
            },
        },
        include: {
            _count: {
                select: {
                    subjects: true,
                },
            },
        },
    });
}

/**
 * Cria uma nova matriz (Degree).
 *
 * @param data Dados para criação da matriz.
 * @returns A matriz criada.
 */
export async function createDegree(data: {
    name: string;
    slug: string;
    programId: string;
    description?: string;
    modality?: string;
    level?: string;
    totalHours?: number;
}): Promise<Degree> {
    try {
        const degree = await prisma.degree.create({
            data: {
                name: data.name,
                slug: data.slug,
                programId: data.programId,
                description: data.description || null,
                modality: data.modality || null,
                level: data.level || null,
                totalHours: data.totalHours || null,
            },
        });

        return degree;
    } catch (error) {
        if (error instanceof Error && error.message.includes("Unique constraint failed")) {
            throw new Error("Já existe uma matriz com este slug (identificador) no sistema.");
        }
        throw error;
    }
}

/**
 * Atualiza uma matriz (Degree) existente pelo ID.
 *
 * @param id ID da matriz.
 * @param data Dados para atualização.
 * @returns A matriz atualizada.
 */
export async function updateDegree(
    id: string,
    data: {
        name: string;
        description?: string;
        modality?: string;
        level?: string;
        totalHours?: number;
    },
): Promise<Degree> {
    try {
        const degree = await prisma.degree.update({
            where: {
                id,
            },
            data: {
                name: data.name,
                description: data.description || null,
                modality: data.modality || null,
                level: data.level || null,
                totalHours: data.totalHours || null,
            },
        });

        return degree;
    } catch (error) {
        if (error instanceof Error && error.message.includes("Record to update not found")) {
            throw new Error("Matriz não encontrada.");
        }
        throw error;
    }
}

/**
 * Remove uma matriz (Degree) pelo ID.
 *
 * @param id ID da matriz a ser removida.
 * @returns A matriz removida.
 */
export async function deleteDegree(id: string): Promise<Degree> {
    try {
        const degree = await prisma.degree.delete({
            where: {
                id,
            },
        });
        return degree;
    } catch (error) {
        const msg = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
        if ((error as { code?: string })?.code === "P2003" || msg.includes("foreign key constraint") || msg.includes("violates restrict")) {
            throw new Error("Não é possível excluir esta matriz porque existem disciplinas curriculares baseadas nela.");
        }
        if (error instanceof Error && error.message.includes("Record to delete does not exist")) {
            throw new Error("Matriz não encontrada.");
        }
        throw error;
    }
}
