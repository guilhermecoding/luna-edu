import type { Period } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";

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
}
