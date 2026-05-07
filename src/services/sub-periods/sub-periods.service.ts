import { Prisma, SubPeriod } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";
import { cacheLife, cacheTag } from "next/cache";

/**
 * Lista todos os sub-períodos (bimestres/trimestres) de um período,
 * ordenados pelo campo `order`.
 */
export async function getSubPeriodsByPeriodId(periodId: string) {
    "use cache";
    cacheLife("max");
    cacheTag(`period:${periodId}:sub-periods`);

    return await prisma.subPeriod.findMany({
        where: { periodId },
        orderBy: { order: "asc" },
    });
}

/**
 * Busca um sub-período específico pelo período e slug.
 */
export async function getSubPeriodByPeriodIdAndSlug(
    periodId: string,
    slug: string,
) {
    "use cache";
    cacheLife("max");
    cacheTag(`period:${periodId}:sub-period:${slug}`);

    return await prisma.subPeriod.findUnique({
        where: {
            periodId_slug: {
                periodId,
                slug,
            },
        },
    });
}

/**
 * Cria um novo sub-período dentro de um período.
 * Valida sobreposição de datas com outros sub-períodos do mesmo período.
 */
export async function createSubPeriod(data: {
    name: string;
    slug: string;
    order: number;
    startDate: Date;
    endDate: Date;
    weight?: number;
    periodId: string;
}): Promise<SubPeriod> {
    try {
        return await prisma.$transaction(async (tx) => {
            // Verificar sobreposição de datas
            const overlapping = await tx.subPeriod.findFirst({
                where: {
                    periodId: data.periodId,
                    startDate: { lte: data.endDate },
                    endDate: { gte: data.startDate },
                },
                select: { id: true, name: true },
            });

            if (overlapping) {
                throw new Error(
                    `As datas se sobrepõem com "${overlapping.name}". Ajuste o intervalo.`,
                );
            }

            return tx.subPeriod.create({
                data: {
                    name: data.name,
                    slug: data.slug,
                    order: data.order,
                    startDate: data.startDate,
                    endDate: data.endDate,
                    weight: data.weight ?? 1.0,
                    periodId: data.periodId,
                },
            });
        });
    } catch (error) {
        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002"
        ) {
            const target = (error.meta?.target as string[]) ?? [];
            if (target.includes("order")) {
                throw new Error(
                    "Já existe um sub-período com esta ordem neste período.",
                );
            }
            throw new Error(
                "Já existe um sub-período com este código neste período.",
            );
        }
        throw error;
    }
}

/**
 * Atualiza os dados de um sub-período.
 */
export async function updateSubPeriod(
    id: string,
    data: {
        name: string;
        startDate: Date;
        endDate: Date;
        weight?: number;
    },
): Promise<SubPeriod> {
    try {
        return await prisma.$transaction(async (tx) => {
            const subPeriod = await tx.subPeriod.findUnique({
                where: { id },
                select: { periodId: true },
            });

            if (!subPeriod) {
                throw new Error("Sub-período não encontrado.");
            }

            // Verificar sobreposição de datas (excluindo este próprio)
            const overlapping = await tx.subPeriod.findFirst({
                where: {
                    periodId: subPeriod.periodId,
                    id: { not: id },
                    startDate: { lte: data.endDate },
                    endDate: { gte: data.startDate },
                },
                select: { id: true, name: true },
            });

            if (overlapping) {
                throw new Error(
                    `As datas se sobrepõem com "${overlapping.name}". Ajuste o intervalo.`,
                );
            }

            return tx.subPeriod.update({
                where: { id },
                data: {
                    name: data.name,
                    startDate: data.startDate,
                    endDate: data.endDate,
                    weight: data.weight,
                },
            });
        });
    } catch (error) {
        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2025"
        ) {
            throw new Error("Sub-período não encontrado.");
        }
        throw error;
    }
}

/**
 * Fecha um sub-período, impedindo edição de notas.
 */
export async function closeSubPeriod(id: string): Promise<SubPeriod> {
    return await prisma.subPeriod.update({
        where: { id },
        data: {
            closedAt: new Date(),
        },
    });
}

/**
 * Reabre um sub-período que estava fechado.
 */
export async function reopenSubPeriod(id: string): Promise<SubPeriod> {
    return await prisma.subPeriod.update({
        where: { id },
        data: {
            closedAt: null,
        },
    });
}

/**
 * Remove um sub-período.
 * Falha se houver atividades vinculadas.
 */
export async function deleteSubPeriod(id: string): Promise<SubPeriod> {
    try {
        return await prisma.subPeriod.delete({
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
                "Não é possível excluir este sub-período porque existem atividades vinculadas a ele.",
            );
        }
        if (
            error instanceof Error &&
            error.message.includes("Record to delete does not exist")
        ) {
            throw new Error("Sub-período não encontrado.");
        }
        throw error;
    }
}
