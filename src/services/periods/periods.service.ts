import type { Period } from "@/generated/prisma/client";
import { cacheLife, cacheTag } from "next/cache";
import prisma from "@/lib/prisma";

export type PeriodListItem = Pick<
    Period,
    "id" | "name" | "slug" | "startDate" | "endDate" | "completedAt"
>;

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
    const overlappingPeriod = await prisma.period.findFirst({
        where: {
            program: {
                slug: programSlug,
            },
            startDate: {
                lte: data.endDate,
            },
            endDate: {
                gte: data.startDate,
            },
        },
        select: {
            id: true,
        },
    });

    if (overlappingPeriod) {
        throw new Error("Não é possível ter períodos no mesmo intervalo de tempo.");
    }

    try {
        return await prisma.period.create({
            data: {
                name: data.name,
                slug: data.slug,
                startDate: data.startDate,
                endDate: data.endDate,
                program: {
                    connect: {
                        slug: programSlug,
                    },
                },
            },
        });
    } catch (error) {
        if (error instanceof Error && error.message.includes("Unique constraint failed")) {
            throw new Error("Já existe um período com este slug. Tente outro.");
        }

        throw error;
    }
}

export async function getPeriodsByProgramSlug(
    programSlug: string,
): Promise<PeriodListItem[]> {
    "use cache";
    cacheLife("weeks");
    cacheTag(`program-periods:${programSlug}`);

    return prisma.period.findMany({
        where: { program: { slug: programSlug } },
        orderBy: [{ startDate: "desc" }, { createdAt: "desc" }],
        select: {
            id: true,
            name: true,
            slug: true,
            startDate: true,
            endDate: true,
            completedAt: true,
        },
    });
}
