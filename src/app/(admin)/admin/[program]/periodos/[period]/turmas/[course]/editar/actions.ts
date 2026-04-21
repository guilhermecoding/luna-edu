"use server";

import { updateCourse, getCourseByPeriodIdAndCode } from "@/services/courses/courses.service";
import { getPeriodByProgramAndSlug } from "@/services/periods/periods.service";
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
        
        const period = await getPeriodByProgramAndSlug(programSlug, periodSlug);
        if (!period) {
            throw new Error("Período não encontrado.");
        }

        const course = await getCourseByPeriodIdAndCode(period.id, courseCode);
        if (!course) {
            throw new Error("Turma não encontrada.");
        }

        await updateCourse(course.id, {
            name: validatedData.name,
            code: validatedData.code,
            subjectId: validatedData.subjectId,
            roomId: validatedData.roomId || null,
            shift: validatedData.shift as Shift,
            classGroupId: validatedData.classGroupId || null,
            schedules: validatedData.schedules.map((s) => ({
                dayOfWeek: s.dayOfWeek as DayOfWeek,
                timeSlotId: s.timeSlotId,
                teacherId: s.teacherId || null,
                roomId: s.roomId || null,
            })),
        });

        updateTag(`period:${course.periodId}:courses`);
        updateTag(`period:${course.periodId}:course:${courseCode}`);
        if (courseCode !== validatedData.code) {
            updateTag(`period:${course.periodId}:course:${validatedData.code}`);
        }
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
