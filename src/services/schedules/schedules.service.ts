import { Shift, TimeSlot } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";
import { cacheLife, cacheTag, revalidateTag } from "next/cache";

/**
 * Retorna os time slots de um programa específico.
 * Cada programa tem sua própria grade de horários independente.
 * 
 * @param programSlug - Slug identificador do programa.
 * @returns Array de objetos TimeSlot ordenados por horário de início.
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
                { startTime: "asc" },
            ],
        });
    } catch {
        // Tabela ainda não existe (migração pendente)
        return [];
    }
}

/**
 * Retorna todos os usuários que possuem a flag de professor e estão ativos.
 * 
 * @returns Lista de professores (id, name, email).
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
 * Cria um novo time slot (horário de aula) vinculado a um programa.
 * 
 * @param data - Dados do horário incluindo nome, tempos, turno e ID do programa.
 * @returns O TimeSlot recém-criado.
 */
export async function createTimeSlot(data: {
    name: string;
    startTime: string;
    endTime: string;
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
 * Atualiza os dados de um horário existente.
 * 
 * @param id - UUID do TimeSlot.
 * @param data - Novos dados do horário.
 * @returns O TimeSlot atualizado.
 */
export async function updateTimeSlot(
    id: string,
    data: {
        name: string;
        startTime: string;
        endTime: string;
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
 * Remove um horário do sistema.
 * 
 * @param id - UUID do TimeSlot a ser excluído.
 * @returns O TimeSlot removido.
 */
export async function deleteTimeSlot(id: string): Promise<TimeSlot> {
    const timeSlot = await prisma.timeSlot.delete({
        where: { id },
    });

    revalidateTag(`program:${timeSlot.programId}:time-slots`, "max");
    return timeSlot;
}
