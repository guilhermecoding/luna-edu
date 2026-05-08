import { Course, DayOfWeek, Prisma, Shift } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";
import { cacheLife, cacheTag } from "next/cache";
import { CourseWithRelations } from "./courses.type";

/**
 * Lista todas as turmas de um período específico.
 * Inclui dados da disciplina e da sala para exibição na listagem.
 */
export async function getCoursesByPeriodId(periodId: string) {
    "use cache";
    cacheLife("max");
    cacheTag(`period:${periodId}:courses`);

    return await prisma.course.findMany({
        where: {
            periodId,
        },
        include: {
            subject: true,
            room: {
                include: {
                    campus: true,
                },
            },
            classGroup: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                },
            },
        },
        orderBy: [
            { classGroup: { name: "asc" } },
            { name: "asc" },
            { createdAt: "desc" },
        ],
    });
}

/**
 * Lista todas as disciplinas (ofertas) de uma turma física específica.
 */
export async function getCoursesByClassGroupId(classGroupId: string) {
    "use cache";
    cacheLife("max");
    cacheTag(`class-group:${classGroupId}:courses`);

    return await prisma.course.findMany({
        where: {
            classGroupId,
        },
        include: {
            subject: true,
            room: {
                include: {
                    campus: true,
                },
            },
            classGroup: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                },
            },
        },
        orderBy: {
            name: "asc",
        },
    });
}

/**
 * Busca uma turma específica pelo período e código.
 */
export async function getCourseByPeriodIdAndCode(periodId: string, code: string): Promise<CourseWithRelations | null> {
    return await prisma.course.findUnique({
        where: {
            periodId_code: {
                periodId,
                code,
            },
        },
        include: {
            subject: true,
            room: {
                include: {
                    campus: true,
                },
            },
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
                orderBy: [
                    { dayOfWeek: "asc" },
                    { timeSlot: { startTime: "asc" } },
                ],
            },
        },
    });
}

/**
 * Mapeia erros de unicidade (P2002) do Schedule para mensagens amigáveis.
 * As constraints do Prisma incluem o nome dos campos violados.
 */
function mapScheduleUniqueError(error: Prisma.PrismaClientKnownRequestError): string {
    const target = error.meta?.target as string[] | undefined;
    const targetStr = target?.join(",") ?? "";

    if (targetStr.includes("room_id")) {
        return "Esta sala já está ocupada neste dia e horário por outra turma.";
    }
    if (targetStr.includes("teacher_id")) {
        return "O professor selecionado já possui aula neste dia e horário.";
    }
    if (targetStr.includes("course_id")) {
        return "Esta turma já possui uma aula cadastrada neste dia e horário.";
    }

    return "Conflito de horário detectado. Verifique os horários selecionados.";
}

/**
 * Cria uma nova turma com horários opcionais.
 */
export async function createCourse(data: {
    name: string;
    code: string;
    periodId: string;
    subjectId: string;
    roomId?: string | null;
    shift: Shift;
    classGroupId?: string | null;
    schedules?: {
        dayOfWeek: DayOfWeek;
        timeSlotId: string;
        teacherId?: string | null;
        roomId?: string | null;
    }[];
}): Promise<Course> {
    try {
        const course = await prisma.course.create({
            data: {
                name: data.name,
                code: data.code,
                periodId: data.periodId,
                subjectId: data.subjectId,
                roomId: data.roomId || null,
                shift: data.shift,
                classGroupId: data.classGroupId || null,
                schedules: data.schedules && data.schedules.length > 0
                    ? {
                        create: data.schedules.map((s) => ({
                            dayOfWeek: s.dayOfWeek,
                            timeSlotId: s.timeSlotId,
                            teacherId: s.teacherId || null,
                            roomId: s.roomId || null,
                        })),
                    }
                    : undefined,
            },
        });
        return course;
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
            throw new Error(mapScheduleUniqueError(error));
        }
        throw error;
    }
}

/**
 * Atualiza os dados de uma turma e seus horários.
 * Usa deleteMany + createMany para substituir os schedules.
 */
export async function updateCourse(
    id: string,
    data: {
        name: string;
        code: string;
        subjectId: string;
        roomId?: string | null;
        shift: Shift;
        classGroupId?: string | null;
        schedules?: {
            dayOfWeek: DayOfWeek;
            timeSlotId: string;
            teacherId?: string | null;
            roomId?: string | null;
        }[];
    },
): Promise<Course> {
    try {
        const course = await prisma.$transaction(async (tx) => {
            // Remove todos os schedules antigos
            await tx.schedule.deleteMany({
                where: { courseId: id },
            });

            // Atualiza a turma e cria novos schedules
            return await tx.course.update({
                where: { id },
                data: {
                    name: data.name,
                    code: data.code,
                    subjectId: data.subjectId,
                    roomId: data.roomId || null,
                    shift: data.shift,
                    classGroupId: data.classGroupId || null,
                    schedules: data.schedules && data.schedules.length > 0
                        ? {
                            create: data.schedules.map((s) => ({
                                dayOfWeek: s.dayOfWeek,
                                timeSlotId: s.timeSlotId,
                                teacherId: s.teacherId || null,
                                roomId: s.roomId || null,
                            })),
                        }
                        : undefined,
                },
            });
        });
        return course;
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2002") {
                throw new Error(mapScheduleUniqueError(error));
            }
            if (error.code === "P2025") {
                throw new Error("Turma não encontrada.");
            }
        }
        throw error;
    }
}

/**
 * Deleta uma turma.
 */
export async function deleteCourse(id: string): Promise<Course> {
    try {
        const course = await prisma.course.delete({
            where: {
                id,
            },
        });
        return course;
    } catch (error) {
        const msg = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
        if ((error as { code?: string })?.code === "P2003" || msg.includes("foreign key constraint") || msg.includes("violates restrict")) {
            throw new Error("Não é possível excluir a turma porque existem matrículas, aulas ou atividades vinculadas a ela.");
        }
        if (error instanceof Error && error.message.includes("Record to delete does not exist")) {
            throw new Error("Turma não encontrada.");
        }
        throw error;
    }
}
