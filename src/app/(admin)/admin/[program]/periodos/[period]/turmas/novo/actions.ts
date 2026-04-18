"use server";

import { createCourse } from "@/services/courses/courses.service";
import { getPeriodByProgramAndSlug } from "@/services/periods/periods.service";
import { ZodError } from "zod";
import { courseSchema, type CourseInput } from "../schema";
import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { Shift } from "@/generated/prisma/client";

export async function createCourseAction(
    programSlug: string,
    periodSlug: string,
    data: CourseInput,
) {
    try {
        const validatedData = courseSchema.parse(data);
        const period = await getPeriodByProgramAndSlug(programSlug, periodSlug);

        if (!period) {
            throw new Error("Período não encontrado.");
        }

        await createCourse({
            name: validatedData.name,
            periodId: period.id,
            subjectId: validatedData.subjectId,
            roomId: validatedData.roomId || null,
            shift: validatedData.shift as Shift,
        });

        updateTag(`period:${period.id}:courses`);
        updateTag(`program-periods:${programSlug}`);
        revalidatePath(`/admin/${programSlug}/periodos/${periodSlug}/turmas`);
    } catch (error) {
        if (error instanceof ZodError) {
            return { success: false, error: error.issues[0]?.message || "Erro de validação" };
        }
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: "Erro ao criar turma" };
    }

    const params = new URLSearchParams({
        toast: "success",
        message: "Turma criada com sucesso",
    });

    redirect(`/admin/${programSlug}/periodos/${periodSlug}/turmas?${params.toString()}`);
}
