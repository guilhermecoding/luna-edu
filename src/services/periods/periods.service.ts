import type { Period } from "@/generated/prisma/client";
import { cacheLife, cacheTag } from "next/cache";
import prisma from "@/lib/prisma";
import { PeriodListItem } from "./periods.type";

/**
 * Cria um novo período para o programa identificado pelo slug.
 *
 * Usa `connect` com o `id` do programa para manter a integridade da relação.
 *
 * @param programSlug Slug do programa que receberá o período.
 * @param data Dados do período.
 * @returns Período criado.
 * @throws Error Quando o programa não for encontrado.
 */
export async function createPeriod(
    programSlug: string,
    data: {
        name: string;
        slug: string;
        startDate: Date;
        endDate: Date;
    },
): Promise<Period> {
    try {
        return await prisma.$transaction(async (tx) => {
            const program = await tx.program.findUnique({
                where: {
                    slug: programSlug,
                },
                select: {
                    id: true,
                },
            });

            if (!program) {
                throw new Error("Programa não encontrado.");
            }

            const overlappingOpenPeriod = await tx.period.findFirst({
                where: {
                    programId: program.id,
                    startDate: {
                        lte: data.endDate,
                    },
                    endDate: {
                        gte: data.startDate,
                    },
                    completedAt: null,
                },
                select: {
                    id: true,
                },
            });

            if (overlappingOpenPeriod) {
                throw new Error("Não é possível ter períodos no mesmo intervalo de tempo.");
            }

            return tx.period.create({
                data: {
                    name: data.name,
                    slug: data.slug,
                    startDate: data.startDate,
                    endDate: data.endDate,
                    programId: program.id,
                },
            });
        });
    } catch (error) {
        if (error instanceof Error && error.message.includes("Unique constraint failed")) {
            throw new Error("Já existe um período com este slug. Tente outro.");
        }

        throw error;
    }
}

/**
 * Lista os períodos de um programa pelo slug.
 *
 * Usa cache com tag `program-periods:${programSlug}` para acelerar leituras
 * e permitir invalidação precisa após mutações.
 *
 * @param programSlug Slug do programa.
 * @returns Lista de períodos ordenada por início (mais recente primeiro).
 */
export async function getPeriodsByProgramSlug(
    programSlug: string,
): Promise<PeriodListItem[]> {
    "use cache";
    cacheLife("weeks");
    cacheTag(`program-periods:${programSlug}`);

    const program = await prisma.program.findUnique({
        where: {
            slug: programSlug,
        },
        select: {
            id: true,
        },
    });

    if (!program) {
        return [];
    }

    const periods = await prisma.period.findMany({
        where: { programId: program.id },
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

    // Buscar contagem de matriculados separadamente para evitar N+1 e limitações do _count
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

/**
 * Busca um período específico dentro de um programa usando slug composto.
 *
 * Usa cache com tag `period:${programSlug}:${periodSlug}` para reaproveitar
 * leituras frequentes da tela de edição/detalhes.
 *
 * @param programSlug Slug do programa.
 * @param periodSlug Slug do período.
 * @returns Período encontrado ou `null` quando programa/período não existir.
 */
export async function getPeriodByProgramAndSlug(
    programSlug: string,
    periodSlug: string,
): Promise<Period | null> {
    "use cache";
    cacheLife("weeks");
    cacheTag(`period:${programSlug}:${periodSlug}`);

    const program = await prisma.program.findUnique({
        where: {
            slug: programSlug,
        },
        select: {
            id: true,
        },
    });

    if (!program) {
        return null;
    }

    return prisma.period.findUnique({
        where: {
            programId_slug: {
                programId: program.id,
                slug: periodSlug,
            },
        },
    });
}

/**
 * Atualiza os dados editáveis de um período.
 *
 * Mantém o slug imutável e valida sobreposição de intervalo com outros
 * períodos em aberto (`completedAt: null`) do mesmo programa.
 *
 * @param programSlug Slug do programa.
 * @param periodSlug Slug do período a ser atualizado.
 * @param data Dados permitidos para edição.
 * @returns Período atualizado.
 * @throws Error Quando programa/período não forem encontrados.
 * @throws Error Quando houver conflito de intervalo com outro período em aberto.
 */
export async function updatePeriod(
    programSlug: string,
    periodSlug: string,
    data: {
        name: string;
        startDate: Date;
        endDate: Date;
        status: "active" | "completed";
    },
): Promise<Period> {
    return prisma.$transaction(async (tx) => {
        const program = await tx.program.findUnique({
            where: {
                slug: programSlug,
            },
            select: {
                id: true,
            },
        });

        if (!program) {
            throw new Error("Programa não encontrado.");
        }

        const period = await tx.period.findUnique({
            where: {
                programId_slug: {
                    programId: program.id,
                    slug: periodSlug,
                },
            },
            select: {
                id: true,
                completedAt: true,
            },
        });

        if (!period) {
            throw new Error("Período não encontrado.");
        }

        const overlappingOpenPeriod = await tx.period.findFirst({
            where: {
                programId: program.id,
                id: {
                    not: period.id,
                },
                startDate: {
                    lte: data.endDate,
                },
                endDate: {
                    gte: data.startDate,
                },
                completedAt: null,
            },
            select: {
                id: true,
            },
        });

        if (overlappingOpenPeriod) {
            throw new Error("Não é possível ter períodos no mesmo intervalo de tempo.");
        }

        return tx.period.update({
            where: {
                programId_slug: {
                    programId: program.id,
                    slug: periodSlug,
                },
            },
            data: {
                name: data.name,
                startDate: data.startDate,
                endDate: data.endDate,
                completedAt: data.status === "active" ? null : period.completedAt ?? new Date(),
            },
        });
    });
}

/**
 * Remove um período de um programa pelo slug composto.
 *
 * @param programSlug Slug do programa.
 * @param periodSlug Slug do período.
 * @returns Período removido.
 * @throws Error Quando programa/período não forem encontrados.
 */
export async function deletePeriod(programSlug: string, periodSlug: string): Promise<Period> {
    try {
        return await prisma.$transaction(async (tx) => {
            const program = await tx.program.findUnique({
                where: {
                    slug: programSlug,
                },
                select: {
                    id: true,
                },
            });

            if (!program) {
                throw new Error("Programa não encontrado.");
            }

            const period = await tx.period.findUnique({
                where: {
                    programId_slug: {
                        programId: program.id,
                        slug: periodSlug,
                    },
                },
            });

            if (!period) {
                throw new Error("Período não encontrado.");
            }

            return tx.period.delete({
                where: {
                    programId_slug: {
                        programId: program.id,
                        slug: periodSlug,
                    },
                },
            });
        });
    } catch (error) {
        const msg = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
        if ((error as { code?: string })?.code === "P2003" || msg.includes("foreign key constraint") || msg.includes("violates restrict")) {
            throw new Error("Não é possível excluir o período porque existem turmas ou matrículas associadas a ele.");
        }
        throw error;
    }
}

/**
 * Retorna estatísticas de alunos para um período específico.
 * 
 * Usa 'some' nos relacionamentos para contar de forma eficiente apenas 
 * alunos que possuem ao menos uma matrícula em turmas deste período.
 * 
 * @param periodId ID do período.
 * @returns Objeto com total global de alunos e total de alunos matriculados no período.
 */
export async function getPeriodStats(periodId: string) {
    const [totalStudents, enrolledStudents] = await Promise.all([
        prisma.studentPeriod.count({
            where: {
                periodId: periodId,
            },
        }),
        prisma.student.count({
            where: {
                enrollments: {
                    some: {
                        course: {
                            periodId: periodId,
                        },
                    },
                },
            },
        }),
    ]);

    return {
        totalStudents,
        enrolledStudents,
    };
}
