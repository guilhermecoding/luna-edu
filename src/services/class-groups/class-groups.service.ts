import { ClassGroup, Prisma } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";
import { cacheLife, cacheTag } from "next/cache";

/**
 * Lista todos os grupos (turmas físicas) de um período.
 * Inclui contagem de turmas disciplinares vinculadas.
 */
export async function getClassGroupsByPeriodId(periodId: string) {
    "use cache";
    cacheLife("max");
    cacheTag(`period:${periodId}:class-groups`);

    return await prisma.classGroup.findMany({
        where: { periodId },
        orderBy: [{ name: "asc" }, { createdAt: "desc" }],
        include: {
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
            courses: {
                include: {
                    subject: true,
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
 * Cria um novo grupo (turma física) dentro de um período.
 */
export async function createClassGroup(data: {
    name: string;
    slug: string;
    periodId: string;
}): Promise<ClassGroup> {
    try {
        return await prisma.classGroup.create({
            data: {
                name: data.name,
                slug: data.slug,
                periodId: data.periodId,
            },
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
