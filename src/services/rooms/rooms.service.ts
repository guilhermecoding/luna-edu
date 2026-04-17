import prisma from "@/lib/prisma";
import { Prisma, Room } from "@/generated/prisma/client";
import { cacheLife, cacheTag } from "next/cache";

/**
 * Retorna as salas de um determinado campus.
 */
export async function getRoomsByCampus(campusSlug: string): Promise<Room[]> {
    "use cache";
    cacheLife("max");
    cacheTag(`campus:${campusSlug}:rooms`);

    return await prisma.room.findMany({
        where: {
            campus: {
                slug: campusSlug,
            },
        },
        orderBy: {
            name: "asc",
        },
    });
}

/**
 * Retorna uma sala pelo slug e slug do campus.
 */
export async function getRoomBySlug(campusSlug: string, roomSlug: string): Promise<Room | null> {
    "use cache";
    cacheLife("max");
    cacheTag(`campus:${campusSlug}:room:${roomSlug}`);

    return await prisma.room.findFirst({
        where: {
            slug: roomSlug,
            campus: {
                slug: campusSlug,
            },
        },
    });
}

/**
 * Cria uma nova sala.
 */
export async function createRoom(data: {
    name: string;
    capacity: number | bigint;
    block?: string | null;
    slug: string;
    campusId: string;
}): Promise<Room> {
    try {
        const room = await prisma.room.create({
            data: {
                name: data.name,
                capacity: BigInt(data.capacity),
                block: data.block,
                slug: data.slug,
                campusId: data.campusId,
            },
        });
        return room;
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
            throw new Error("Já existe uma sala com este slug neste campus.");
        }
        throw error;
    }
}

/**
 * Atualiza os dados de uma sala.
 */
export async function updateRoom(
    id: string,
    data: {
        name: string;
        capacity: number | bigint;
        block?: string | null;
    },
): Promise<Room> {
    try {
        const room = await prisma.room.update({
            where: {
                id,
            },
            data: {
                name: data.name,
                capacity: BigInt(data.capacity),
                block: data.block,
            },
        });
        return room;
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2025") {
                throw new Error("Sala não encontrada.");
            }
        }
        throw error;
    }
}

/**
 * Deleta uma sala.
 */
export async function deleteRoom(id: string): Promise<Room> {
    try {
        const room = await prisma.room.delete({
            where: {
                id,
            },
        });
        return room;
    } catch (error) {
        const msg = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
        if ((error as { code?: string })?.code === "P2003" || msg.includes("foreign key constraint") || msg.includes("violates restrict")) {
            throw new Error("Não é possível excluir a sala porque existem recursos (ex: cursos/turmas) vinculados a ela.");
        }
        if (error instanceof Error && error.message.includes("Record to delete does not exist")) {
            throw new Error("Sala não encontrada.");
        }
        throw error;
    }
}
