import { DayOfWeek, Shift, TimeSlot } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";
import { cacheLife, cacheTag, revalidateTag } from "next/cache";

/**
 * Retorna os time slots de um programa específico.
 * Cada programa tem sua própria grade de horários independente.
 */
export async function getTimeSlotsByProgramSlug(programSlug: string) {
    "use cache";
    cacheLife("max");
    cacheTag(`program:${programSlug}:time-slots`);

    try {
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
    } catch {
        // Tabela ainda não existe (migração pendente)
        return [];
    }
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

/**
 * Cria um novo time slot.
 */
export async function createTimeSlot(data: {
    name: string;
    startTime: string;
    endTime: string;
    order: number;
    shift: Shift;
    programId: string;
}): Promise<TimeSlot> {
    const timeSlot = await prisma.timeSlot.create({
        data,
    });

    revalidateTag(`program:${data.programId}:time-slots`, "max");
    return timeSlot;
}

/**
 * Atualiza um time slot.
 */
export async function updateTimeSlot(
    id: string,
    data: {
        name: string;
        startTime: string;
        endTime: string;
        order: number;
        shift: Shift;
    },
): Promise<TimeSlot> {
    const timeSlot = await prisma.timeSlot.update({
        where: { id },
        data,
    });

    revalidateTag(`program:${timeSlot.programId}:time-slots`, "max");
    return timeSlot;
}

/**
 * Deleta um time slot.
 */
export async function deleteTimeSlot(id: string): Promise<TimeSlot> {
    const timeSlot = await prisma.timeSlot.delete({
        where: { id },
    });

    revalidateTag(`program:${timeSlot.programId}:time-slots`, "max");
    return timeSlot;
}
