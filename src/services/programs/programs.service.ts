import { Program } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";
import { cacheLife, cacheTag } from "next/cache";

/**
 * Lista todos os programas disponíveis.
 *
 * Usa cache com tag `programs:list` para acelerar leitura e permitir invalidação
 * quando houver criação ou atualização.
 *
 * @returns Lista de programas.
 */
export async function getPrograms(): Promise<Program[]> {
    "use cache";
    cacheLife("weeks");
    cacheTag("programs:list");

    return await prisma.program.findMany({
        orderBy: {
            name: "asc",
        },
    });
}

/**
 * Cria um novo programa.
 *
 * @param data Dados de criação do programa.
 * @param data.name Nome do programa.
 * @param data.slug Slug único do programa.
 * @param data.description Descrição opcional do programa.
 * @returns Programa criado.
 * @throws Error Quando já existe programa com o mesmo slug.
 */
export async function createProgram(data: {
    name: string;
    slug: string;
    description?: string;
}): Promise<Program> {
    try {
        const program = await prisma.program.create({
            data: {
                name: data.name,
                slug: data.slug,
                description: data.description,
            },
        });

        return program;
    } catch (error) {
        if (error instanceof Error && error.message.includes("Unique constraint failed")) {
            throw new Error("Já existe um programa com este slug");
        }
        throw error;
    }
}

/**
 * Busca um programa pelo slug.
 *
 * Usa cache com tag `program:${slug}` para reaproveitar leituras frequentes.
 *
 * @param slug Slug do programa.
 * @returns Programa encontrado ou `null` quando não existe.
 */
export async function getProgramBySlug(slug: string): Promise<Program | null> {
    return await prisma.program.findUnique({
        where: {
            slug,
        },
    });
}

/**
 * Atualiza dados editáveis de um programa pelo slug.
 *
 * O slug não é alterado por esta função.
 *
 * @param slug Slug do programa a ser atualizado.
 * @param data Dados permitidos para atualização.
 * @param data.name Novo nome do programa.
 * @param data.description Nova descrição opcional do programa.
 * @returns Programa atualizado.
 * @throws Error Quando o programa não for encontrado.
 */
export async function updateProgram(
    slug: string,
    data: {
        name: string;
        description?: string;
    },
): Promise<Program> {
    try {
        const program = await prisma.program.update({
            where: {
                slug,
            },
            data: {
                name: data.name,
                description: data.description,
            },
        });

        return program;
    } catch (error) {
        if (error instanceof Error && error.message.includes("Record to update not found")) {
            throw new Error("Programa não encontrado");
        }

        throw error;
    }
}

/**
 * Remove um programa pelo slug.
 *
 * @param slug Slug do programa a ser removido.
 * @returns Programa removido.
 * @throws Error Quando o programa não for encontrado.
 */
export async function deleteProgram(slug: string): Promise<Program> {
    try {
        const program = await prisma.program.delete({
            where: {
                slug,
            },
        });

        return program;
    } catch (error) {
        const msg = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
        if ((error as { code?: string })?.code === "P2003" || msg.includes("foreign key constraint") || msg.includes("violates restrict")) {
            throw new Error("Não é possível excluir o programa porque existem períodos ou matrizes curriculares vinculados a ele.");
        }
        if (error instanceof Error && error.message.includes("Record to delete does not exist")) {
            throw new Error("Programa não encontrado");
        }

        throw error;
    }
}

/**
 * Busca os programas e períodos ativos em que um professor específico possui horários alocados.
 * Um período é considerado ativo se `completedAt` for nulo.
 * 
 * @param teacherId ID do professor
 * @returns Lista de programas contendo os períodos ativos associados ao professor.
 */
export async function getActiveProgramsAndPeriodsForTeacher(teacherId: string) {
    "use cache";
    cacheLife("minutes");
    cacheTag(`teacher-programs-${teacherId}`);

    return await prisma.program.findMany({
        where: {
            periods: {
                some: {
                    completedAt: null,
                    courses: {
                        some: {
                            schedules: {
                                some: {
                                    teacherId: teacherId,
                                },
                            },
                        },
                    },
                },
            },
        },
        include: {
            periods: {
                where: {
                    completedAt: null,
                    courses: {
                        some: {
                            schedules: {
                                some: {
                                    teacherId: teacherId,
                                },
                            },
                        },
                    },
                },
                orderBy: {
                    startDate: "desc",
                },
            },
        },
        orderBy: {
            name: "asc",
        },
    });
}