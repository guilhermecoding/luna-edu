import prisma from "@/lib/prisma";
import { cacheLife, cacheTag } from "next/cache";

/**
 * Retorna os time slots de um programa específico.
 * Cada programa tem sua própria grade de horários independente.
 */
export async function getTimeSlotsByProgramSlug(programSlug: string) {
    "use cache";
    cacheLife("max");
    cacheTag(`program:${programSlug}:time-slots`);

    return await prisma.timeSlot.findMany({
        where: {
            program: {
                slug: programSlug,
            },
        },
        orderBy: [
            { shift: "asc" },
            { order: "asc" },
        ],
    });
}

/**
 * Retorna todos os usuários que são professores.
 */
export async function getTeachers() {
    "use cache";
    cacheLife("max");
    cacheTag("all-teachers");

    return await prisma.user.findMany({
        where: {
            isTeacher: true,
            isActive: true,
        },
        select: {
            id: true,
            name: true,
            email: true,
        },
        orderBy: {
            name: "asc",
        },
    });
}
