"use server";

import { updateCourse, getCourseByPeriodIdAndCode } from "@/services/courses/courses.service";
import { deleteCourse } from "@/services/courses/courses.service";
import { getPeriodByProgramAndSlug } from "@/services/periods/periods.service";
import { ZodError, z } from "zod";
import { courseSchema, type CourseInput } from "../../schema";
import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { DayOfWeek, Shift } from "@/generated/prisma/client";

const deleteCourseSchema = z.object({
    confirmationName: z.string().min(1, "Digite o nome da disciplina para confirmar"),
});

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
            throw new Error("Disciplina não encontrada.");
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
        return { success: false, error: "Erro ao atualizar disciplina" };
    }

    const params = new URLSearchParams({
        toast: "success",
        message: "Disciplina atualizada com sucesso",
    });

    redirect(`/admin/${programSlug}/periodos/${periodSlug}/turmas?${params.toString()}`);
}

export async function deleteCourseAction(
    programSlug: string,
    periodSlug: string,
    courseCode: string,
    confirmationName: string,
) {
    try {
        const validatedData = deleteCourseSchema.parse({ confirmationName });
        const period = await getPeriodByProgramAndSlug(programSlug, periodSlug);
        if (!period) {
            return { success: false, error: "Período não encontrado." };
        }

        const course = await getCourseByPeriodIdAndCode(period.id, courseCode);
        if (!course) {
            return { success: false, error: "Disciplina não encontrada." };
        }

        if (course.name !== validatedData.confirmationName) {
            return { success: false, error: "O nome digitado não corresponde à disciplina" };
        }

        await deleteCourse(course.id);

        updateTag(`period:${course.periodId}:courses`);
        updateTag(`period:${course.periodId}:course:${course.code}`);
        updateTag(`program-periods:${programSlug}`);
        if (course.classGroupId) {
            updateTag(`class-group:${course.classGroupId}:courses`);
        }
        revalidatePath(`/admin/${programSlug}/periodos/${periodSlug}/turmas`);
    } catch (error) {
        if (error instanceof ZodError) {
            return { success: false, error: error.issues[0]?.message || "Erro de validação" };
        }
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: "Erro ao apagar disciplina" };
    }

    const params = new URLSearchParams({
        toast: "success",
        message: "Disciplina apagada com sucesso",
    });

    redirect(`/admin/${programSlug}/periodos/${periodSlug}/turmas?${params.toString()}`);
}
