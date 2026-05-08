"use server";

import { revalidatePath, updateTag } from "next/cache";
import { DayOfWeek, Shift } from "@/generated/prisma/client";
import { getClassGroupByPeriodIdAndSlug } from "@/services/class-groups/class-groups.service";
import { deleteCourse, getCourseByPeriodIdAndCode, updateCourse } from "@/services/courses/courses.service";
import { getPeriodByProgramAndSlug } from "@/services/periods/periods.service";
import { getSubjectById } from "@/services/subjects/subjects.service";
import { ZodError } from "zod";
import {
    deleteClassGroupCourseSchema,
    editClassGroupCourseSchema,
    type EditClassGroupCourseInput,
} from "./schema";

function revalidateCoursePaths(
    programSlug: string,
    periodSlug: string,
    classGroupSlug: string,
    courseCode: string,
) {
    revalidatePath(`/admin/${programSlug}/periodos/${periodSlug}/turmas/${classGroupSlug}/disciplinas`);
    revalidatePath(`/admin/${programSlug}/periodos/${periodSlug}/turmas/${classGroupSlug}/disciplinas/${courseCode}/editar`);
}

export async function editClassGroupCourseAction(
    programSlug: string,
    periodSlug: string,
    classGroupSlug: string,
    courseCode: string,
    data: EditClassGroupCourseInput,
) {
    try {
        const validatedData = editClassGroupCourseSchema.parse(data);

        const period = await getPeriodByProgramAndSlug(programSlug, periodSlug);
        if (!period) {
            return { success: false, error: "Período não encontrado." };
        }

        const classGroup = await getClassGroupByPeriodIdAndSlug(period.id, classGroupSlug);
        if (!classGroup) {
            return { success: false, error: "Turma não encontrada." };
        }

        const course = await getCourseByPeriodIdAndCode(period.id, courseCode);
        if (!course) {
            return { success: false, error: "Disciplina não encontrada." };
        }

        if (course.classGroupId !== classGroup.id) {
            return { success: false, error: "Disciplina não pertence à turma informada." };
        }

        const subject = await getSubjectById(validatedData.subjectId);
        if (!subject) {
            return { success: false, error: "Disciplina curricular não encontrada." };
        }

        if (subject.degreeId !== classGroup.degreeId || subject.basePeriod !== classGroup.basePeriod) {
            return {
                success: false,
                error: "A disciplina selecionada não pertence a matriz e série desta turma.",
            };
        }

        await updateCourse(course.id, {
            name: validatedData.name,
            code: course.code,
            subjectId: validatedData.subjectId,
            roomId: validatedData.roomId || null,
            shift: validatedData.shift as Shift,
            classGroupId: classGroup.id,
            schedules: validatedData.schedules.map((schedule) => ({
                dayOfWeek: schedule.dayOfWeek as DayOfWeek,
                timeSlotId: schedule.timeSlotId,
                teacherId: schedule.teacherId || null,
                roomId: schedule.roomId || null,
            })),
        });

        updateTag(`period:${period.id}:courses`);
        updateTag(`period:${period.id}:course:${course.code}`);
        updateTag(`class-group:${classGroup.id}:courses`);
        updateTag(`period:${period.id}:class-group:${classGroup.slug}`);
        updateTag(`period:${period.id}:class-groups`);
        updateTag(`program-periods:${programSlug}`);
        revalidateCoursePaths(programSlug, periodSlug, classGroupSlug, course.code);
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
    return {
        success: true,
        redirectTo: `/admin/${programSlug}/periodos/${periodSlug}/turmas/${classGroupSlug}/disciplinas?${params.toString()}`,
    };
}

export async function deleteClassGroupCourseAction(
    programSlug: string,
    periodSlug: string,
    classGroupSlug: string,
    courseCode: string,
    confirmationName: string,
) {
    try {
        const validatedData = deleteClassGroupCourseSchema.parse({ confirmationName });

        const period = await getPeriodByProgramAndSlug(programSlug, periodSlug);
        if (!period) {
            return { success: false, error: "Período não encontrado." };
        }

        const classGroup = await getClassGroupByPeriodIdAndSlug(period.id, classGroupSlug);
        if (!classGroup) {
            return { success: false, error: "Turma não encontrada." };
        }

        const course = await getCourseByPeriodIdAndCode(period.id, courseCode);
        if (!course) {
            return { success: false, error: "Disciplina não encontrada." };
        }

        if (course.classGroupId !== classGroup.id) {
            return { success: false, error: "Disciplina não pertence à turma informada." };
        }

        if (course.name !== validatedData.confirmationName) {
            return { success: false, error: "O nome digitado não corresponde à disciplina" };
        }

        await deleteCourse(course.id);

        updateTag(`period:${period.id}:courses`);
        updateTag(`period:${period.id}:course:${course.code}`);
        updateTag(`class-group:${classGroup.id}:courses`);
        updateTag(`period:${period.id}:class-group:${classGroup.slug}`);
        updateTag(`period:${period.id}:class-groups`);
        updateTag(`program-periods:${programSlug}`);
        revalidateCoursePaths(programSlug, periodSlug, classGroupSlug, course.code);
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
    return {
        success: true,
        redirectTo: `/admin/${programSlug}/periodos/${periodSlug}/turmas/${classGroupSlug}/disciplinas?${params.toString()}`,
    };
}
