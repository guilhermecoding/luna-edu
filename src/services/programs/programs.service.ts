import { Program } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";
import { cacheLife, cacheTag } from "next/cache";
import { PeriodListItem } from "@/services/periods/periods.type";

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
 * Busca os programas em que um professor possui horários alocados (qualquer período).
 * Usado no ProgramSwitcher da sidebar do professor.
 *
 * @param teacherId ID do professor.
 * @returns Lista de programas (name, slug) associados ao professor.
 */
export async function getProgramsForTeacher(teacherId: string) {
    "use cache";
    cacheLife("minutes");
    cacheTag(`teacher-programs-${teacherId}`);

    return await prisma.program.findMany({
        where: {
            periods: {
                some: {
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
        select: {
            name: true,
            slug: true,
        },
        orderBy: {
            name: "asc",
        },
    });
}

/**
 * Busca os períodos de um programa específico em que um professor possui horários alocados.
 * Retorna todos os períodos (ativos e encerrados) para exibição na tela do professor.
 *
 * @param programSlug Slug do programa.
 * @param teacherId ID do professor.
 * @returns Lista de períodos ordenados por data de início (mais recente primeiro).
 */
export async function getPeriodsForTeacherByProgramSlug(
    programSlug: string,
    teacherId: string,
): Promise<PeriodListItem[]> {
    "use cache";
    cacheLife("minutes");
    cacheTag(`teacher-periods-${programSlug}-${teacherId}`);

    const program = await prisma.program.findUnique({
        where: { slug: programSlug },
        select: { id: true },
    });

    if (!program) {
        return [];
    }

    const periods = await prisma.period.findMany({
        where: {
            programId: program.id,
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
        orderBy: [{ startDate: "desc" }, { createdAt: "desc" }],
        select: {
            id: true,
            name: true,
            slug: true,
            startDate: true,
            endDate: true,
            completedAt: true,
            _count: {
                select: {
                    courses: true,
                    studentPeriods: true,
                },
            },
        },
    });

    // Buscar contagem de matriculados
    const enrolledGrouped = await prisma.studentPeriod.groupBy({
        by: ["periodId"],
        where: {
            periodId: { in: periods.map((p) => p.id) },
            status: "ENROLLED",
        },
        _count: {
            _all: true,
        },
    });

    const enrolledMap = new Map(enrolledGrouped.map((g) => [g.periodId, g._count._all]));

    return periods.map((p) => ({
        ...p,
        enrolledCount: enrolledMap.get(p.id) || 0,
    }));
}