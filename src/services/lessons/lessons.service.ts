import prisma from "@/lib/prisma";
import { cacheLife, cacheTag } from "next/cache";

/**
 * Retorna as aulas de uma disciplina (course) ordenadas por data crescente,
 * incluindo contagem de presentes/total de registros de presença.
 */
export async function getLessonsByCourseId(courseId: string) {
    "use cache";
    cacheLife("minutes");
    cacheTag(`course:${courseId}:lessons`);

    return await prisma.lesson.findMany({
        where: { courseId },
        include: {
            teacher: {
                select: { id: true, name: true },
            },
            timeSlot: {
                select: { id: true, name: true, startTime: true, endTime: true },
            },
            _count: {
                select: { attendances: true },
            },
        },
        orderBy: { date: "asc" },
    });
}

export type LessonListItem = Awaited<ReturnType<typeof getLessonsByCourseId>>[number];

/**
 * Retorna uma aula específica pelo ID com seus dados completos.
 */
export async function getLessonById(lessonId: string) {
    return await prisma.lesson.findUnique({
        where: { id: lessonId },
        include: {
            course: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                    classGroupId: true,
                },
            },
            teacher: {
                select: { id: true, name: true },
            },
            timeSlot: {
                select: { id: true, name: true, startTime: true, endTime: true },
            },
        },
    });
}

/**
 * Retorna a contagem de aulas de uma disciplina.
 */
export async function getLessonsCountByCourseId(courseId: string): Promise<number> {
    "use cache";
    cacheLife("minutes");
    cacheTag(`course:${courseId}:lessons-count`);

    return await prisma.lesson.count({ where: { courseId } });
}

/**
 * Retorna os registros de presença de uma aula.
 * Inclui dados do aluno para exibição na tabela.
 */
export async function getAttendancesByLessonId(lessonId: string) {
    "use cache";
    cacheLife("minutes");
    cacheTag(`lesson:${lessonId}:attendances`);

    return await prisma.attendance.findMany({
        where: { lessonId },
        include: {
            student: {
                select: {
                    id: true,
                    name: true,
                    cpf: true,
                    lunaId: true,
                    email: true,
                    genre: true,
                    birthDate: true,
                },
            },
        },
        orderBy: { student: { name: "asc" } },
    });
}

export type AttendanceWithStudent = Awaited<ReturnType<typeof getAttendancesByLessonId>>[number];

/**
 * Retorna estatísticas de presença de uma aula.
 */
export async function getAttendanceStatsByLessonId(lessonId: string) {
    "use cache";
    cacheLife("minutes");
    cacheTag(`lesson:${lessonId}:attendances`);

    const [total, present] = await Promise.all([
        prisma.attendance.count({ where: { lessonId } }),
        prisma.attendance.count({ where: { lessonId, isPresent: true } }),
    ]);

    return { total, present, absent: total - present };
}

/**
 * Cria uma nova aula e gera registros de presença para todos os alunos matriculados
 * na disciplina. O default de isPresent é true (conforme schema.prisma).
 */
export async function createLesson(data: {
    courseId: string;
    date: Date;
    topic: string;
    teacherId?: string | null;
    timeSlotId?: string | null;
    scheduleId?: string | null;
}) {
    return await prisma.$transaction(async (tx) => {
        const lesson = await tx.lesson.create({
            data: {
                courseId: data.courseId,
                date: data.date,
                topic: data.topic,
                teacherId: data.teacherId || null,
                timeSlotId: data.timeSlotId || null,
                scheduleId: data.scheduleId || null,
            },
        });

        // Buscar todos os alunos matriculados nesta disciplina
        const enrollments = await tx.enrollment.findMany({
            where: { courseId: data.courseId },
            select: { studentId: true },
        });

        // Criar registros de presença para todos (isPresent = true por default no DB, mas garantimos explicitamente)
        if (enrollments.length > 0) {
            await tx.attendance.createMany({
                data: enrollments.map((e) => ({
                    lessonId: lesson.id,
                    studentId: e.studentId,
                    isPresent: true,
                })),
            });
        }

        return lesson;
    });
}

/**
 * Atualiza os dados de uma aula.
 */
export async function updateLesson(
    lessonId: string,
    data: {
        date?: Date;
        topic?: string;
        teacherId?: string | null;
        timeSlotId?: string | null;
    },
) {
    return await prisma.lesson.update({
        where: { id: lessonId },
        data,
    });
}

/**
 * Remove uma aula e todos os seus registros de presença.
 */
export async function deleteLesson(lessonId: string) {
    return await prisma.$transaction(async (tx) => {
        await tx.attendance.deleteMany({ where: { lessonId } });
        return await tx.lesson.delete({ where: { id: lessonId } });
    });
}

/**
 * Atualiza o registro de presença de um aluno em uma aula.
 */
export async function updateAttendance(
    attendanceId: string,
    data: { isPresent: boolean; observation?: string | null },
) {
    return await prisma.attendance.update({
        where: { id: attendanceId },
        data,
    });
}

/**
 * Atualiza a presença em lote para uma aula inteira.
 */
export async function bulkUpdateAttendance(
    lessonId: string,
    updates: { id: string; isPresent: boolean; observation?: string | null }[],
) {
    return await prisma.$transaction(async (tx) => {
        for (const u of updates) {
            await tx.attendance.update({
                where: { id: u.id },
                data: {
                    isPresent: u.isPresent,
                    observation: u.observation ?? undefined,
                },
            });
        }

        await tx.lesson.update({
            where: { id: lessonId },
            data: { isDone: true },
        });
    });
}
