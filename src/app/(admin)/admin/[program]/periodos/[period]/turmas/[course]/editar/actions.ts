"use server";

import { updateCourse, getCourseByCode } from "@/services/courses/courses.service";
import { ZodError } from "zod";
import { courseSchema, type CourseInput } from "../../schema";
import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { DayOfWeek, Shift } from "@/generated/prisma/client";

export async function updateCourseAction(
    programSlug: string,
    periodSlug: string,
    courseCode: string,
    data: CourseInput,
) {
    try {
        const validatedData = courseSchema.parse(data);
        const course = await getCourseByCode(courseCode);

        if (!course) {
            throw new Error("Turma não encontrada.");
        }

        await updateCourse(course.id, {
            name: validatedData.name,
            subjectId: validatedData.subjectId,
            roomId: validatedData.roomId || null,
            shift: validatedData.shift as Shift,
            schedules: validatedData.schedules.map((s) => ({
                dayOfWeek: s.dayOfWeek as DayOfWeek,
                timeSlotId: s.timeSlotId,
                teacherId: s.teacherId || null,
                roomId: s.roomId || null,
            })),
        });

        updateTag(`period:${course.periodId}:courses`);
        updateTag(`course:${courseCode}`);
        updateTag(`program-periods:${programSlug}`);
        revalidatePath(`/admin/${programSlug}/periodos/${periodSlug}/turmas`);
    } catch (error) {
        if (error instanceof ZodError) {
            return { success: false, error: error.issues[0]?.message || "Erro de validação" };
        }
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: "Erro ao atualizar turma" };
    }

    const params = new URLSearchParams({
        toast: "success",
        message: "Turma atualizada com sucesso",
    });

    redirect(`/admin/${programSlug}/periodos/${periodSlug}/turmas?${params.toString()}`);
}
