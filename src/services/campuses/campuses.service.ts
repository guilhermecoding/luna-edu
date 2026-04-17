import { Campus } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";
import { cacheLife, cacheTag } from "next/cache";

export type CampusWithRoomCount = Campus & {
    _count: {
        rooms: number;
    };
};

/**
 * Lista todas as instituições/campuses disponíveis com a contagem de salas.
 *
 * @returns Lista de campuses.
 */
export async function getCampuses(): Promise<CampusWithRoomCount[]> {
    "use cache";
    cacheLife("weeks");
    cacheTag("campuses:list");

    return await prisma.campus.findMany({
        include: {
            _count: {
                select: {
                    rooms: true,
                },
            },
        },
        orderBy: {
            name: "asc",
        },
    });
}

/**
 * Cria uma nova instituição (Campus).
 *
 * @param data Dados de criação da instituição.
 * @returns A instituição criada.
 */
export async function createCampus(data: {
    name: string;
    address: string;
}): Promise<Campus> {
    try {
        const campus = await prisma.campus.create({
            data: {
                name: data.name,
                address: data.address,
            },
        });

        return campus;
    } catch (error) {
        throw error;
    }
}

/**
 * Busca uma instituição (Campus) pelo ID.
 *
 * @param id ID da instituição.
 * @returns Instituição encontrada ou `null` quando não existe.
 */
export async function getCampusById(id: string): Promise<Campus | null> {
    "use cache";
    cacheLife("weeks");
    cacheTag(`campus:${id}`);

    return await prisma.campus.findUnique({
        where: {
            id,
        },
    });
}

/**
 * Atualiza dados editáveis de uma instituição pelo ID.
 *
 * @param id ID da instituição a ser atualizada.
 * @param data Dados permitidos para atualização.
 * @returns Instituição atualizada.
 * @throws Error Quando a instituição não for encontrada.
 */
export async function updateCampus(
    id: string,
    data: {
        name: string;
        address: string;
    },
): Promise<Campus> {
    try {
        const campus = await prisma.campus.update({
            where: {
                id,
            },
            data: {
                name: data.name,
                address: data.address,
            },
        });

        return campus;
    } catch (error) {
        if (error instanceof Error && error.message.includes("Record to update not found")) {
            throw new Error("Instituição não encontrada");
        }

        throw error;
    }
}

/**
 * Remove uma instituição pelo ID.
 *
 * @param id ID da instituição a ser removida.
 * @returns Instituição removida.
 * @throws Error Quando a instituição não for encontrada.
 */
export async function deleteCampus(id: string): Promise<Campus> {
    try {
        const campus = await prisma.campus.delete({
            where: {
                id,
            },
        });

        return campus;
    } catch (error) {
        const msg = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
        if ((error as { code?: string })?.code === "P2003" || msg.includes("foreign key constraint") || msg.includes("violates restrict")) {
            throw new Error("Não é possível excluir a instituição porque existem recursos (salas) vinculados a ela.");
        }
        if (error instanceof Error && error.message.includes("Record to delete does not exist")) {
            throw new Error("Instituição não encontrada");
        }

        throw error;
    }
}
