import { ClassGroup, Prisma, Shift } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";
import { cacheLife, cacheTag } from "next/cache";

/**
 * Lista todos os grupos (turmas físicas) de um período.
 * Inclui contagem de turmas disciplinares, dados da Matriz e turno.
 */
export async function getClassGroupsByPeriodId(periodId: string) {
    "use cache";
    cacheLife("max");
    cacheTag(`period:${periodId}:class-groups`);

    return await prisma.classGroup.findMany({
        where: { periodId },
        orderBy: [{ name: "asc" }, { createdAt: "desc" }],
        include: {
            degree: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                },
            },
            _count: {
                select: {
                    courses: true,
                },
            },
        },
    });
}

/**
 * Busca um grupo pelo período e slug.
 */
export async function getClassGroupByPeriodIdAndSlug(
    periodId: string,
    slug: string,
) {
    "use cache";
    cacheLife("max");
    cacheTag(`period:${periodId}:class-group:${slug}`);

    return await prisma.classGroup.findUnique({
        where: {
            periodId_slug: {
                periodId,
                slug,
            },
        },
        include: {
            degree: true,
            courses: {
                include: {
                    subject: true,
                    period: true,
                    schedules: {
                        include: {
                            timeSlot: true,
                            teacher: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                            room: {
                                include: {
                                    campus: true,
                                },
                            },
                        },
                    },
                    room: {
                        include: {
                            campus: true,
                        },
                    },
                },
                orderBy: { name: "asc" },
            },
        },
    });
}

/**
 * Retorna os slugs dos grupos informados, na mesma ordem dos ids únicos.
 * Usado após mutações de curso para invalidar tags `period:…:class-group:…` sem usar Prisma nas server actions.
 */
export async function getClassGroupSlugsByIds(classGroupIds: string[]): Promise<string[]> {
    const uniqueIds = [...new Set(classGroupIds.filter(Boolean))];
    if (uniqueIds.length === 0) {
        return [];
    }
    const rows = await prisma.classGroup.findMany({
        where: { id: { in: uniqueIds } },
        select: { id: true, slug: true },
    });
    const byId = new Map(rows.map((r) => [r.id, r.slug] as const));
    return uniqueIds.map((id) => byId.get(id)).filter((s): s is string => s != null);
}

/**
 * Cria um novo grupo (turma física) e auto-gera as turmas disciplinares
 * baseado nas disciplinas da Matriz (Degree) + Série (basePeriod).
 *
 * Ex: Criar "1º Ano A" com Matriz "Ensino Médio" + basePeriod 1
 * → busca todas as disciplinas do 1º ano do Ensino Médio
 * → cria um Course para cada uma, vinculado ao grupo.
 */
export async function createClassGroup(data: {
    name: string;
    slug: string;
    periodId: string;
    degreeId: string;
    basePeriod: number;
    shift: Shift;
}): Promise<ClassGroup> {
    try {
        return await prisma.$transaction(async (tx) => {
            // 1. Criar o grupo
            const group = await tx.classGroup.create({
                data: {
                    name: data.name,
                    slug: data.slug,
                    periodId: data.periodId,
                    degreeId: data.degreeId,
                    basePeriod: data.basePeriod,
                    shift: data.shift,
                },
            });

            // 2. Buscar disciplinas da Matriz + Série
            const subjects = await tx.subject.findMany({
                where: {
                    degreeId: data.degreeId,
                    basePeriod: data.basePeriod,
                },
                orderBy: { name: "asc" },
            });

            // 3. Auto-gerar turmas disciplinares
            if (subjects.length > 0) {
                await tx.course.createMany({
                    data: subjects.map((subject) => ({
                        name: subject.name,
                        code: `${data.slug}-${subject.code}`.toUpperCase(),
                        periodId: data.periodId,
                        subjectId: subject.id,
                        shift: data.shift,
                        classGroupId: group.id,
                    })),
                });
            }

            return group;
        });
    } catch (error) {
        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002"
        ) {
            throw new Error(
                "Já existe um grupo com este código neste período.",
            );
        }
        throw error;
    }
}

/**
 * Atualiza os dados de um grupo.
 */
export async function updateClassGroup(
    id: string,
    data: {
        name: string;
    },
): Promise<ClassGroup> {
    try {
        return await prisma.classGroup.update({
            where: { id },
            data: {
                name: data.name,
            },
        });
    } catch (error) {
        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2025"
        ) {
            throw new Error("Grupo não encontrado.");
        }
        throw error;
    }
}

/**
 * Remove um grupo.
 * Falha se houver turmas vinculadas.
 */
export async function deleteClassGroup(id: string): Promise<ClassGroup> {
    try {
        return await prisma.classGroup.delete({
            where: { id },
        });
    } catch (error) {
        const msg =
            error instanceof Error
                ? error.message.toLowerCase()
                : String(error).toLowerCase();
        if (
            (error as { code?: string })?.code === "P2003" ||
            msg.includes("foreign key constraint") ||
            msg.includes("violates restrict")
        ) {
            throw new Error(
                "Não é possível excluir o grupo porque existem turmas vinculadas a ele. Remova as turmas primeiro.",
            );
        }
        if (
            error instanceof Error &&
            error.message.includes("Record to delete does not exist")
        ) {
            throw new Error("Grupo não encontrado.");
        }
        throw error;
    }
}
