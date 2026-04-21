"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { ZodError } from "zod";
import { createCourse, getCoursesByClassGroupId } from "@/services/courses/courses.service";
import { getClassGroupByPeriodIdAndSlug } from "@/services/class-groups/class-groups.service";
import { getPeriodByProgramAndSlug } from "@/services/periods/periods.service";
import { getSubjectById } from "@/services/subjects/subjects.service";
import { createClassGroupSubjectSchema, type CreateClassGroupSubjectInput } from "./schema";

export async function createClassGroupSubjectAction(
    programSlug: string,
    periodSlug: string,
    classGroupSlug: string,
    data: CreateClassGroupSubjectInput,
) {
    try {
        const validatedData = createClassGroupSubjectSchema.parse(data);

        const period = await getPeriodByProgramAndSlug(programSlug, periodSlug);
        if (!period) {
            return { success: false, error: "Período não encontrado." };
        }

        const classGroup = await getClassGroupByPeriodIdAndSlug(period.id, classGroupSlug);
        if (!classGroup) {
            return { success: false, error: "Turma não encontrada." };
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

        const currentCourses = await getCoursesByClassGroupId(classGroup.id);
        const alreadyExists = currentCourses.some((course) => course.subjectId === subject.id);
        if (alreadyExists) {
            return { success: false, error: "Esta disciplina já está ofertada nesta turma." };
        }

        await createCourse({
            name: subject.name,
            code: `${classGroup.slug}-${subject.code}`.toUpperCase(),
            periodId: period.id,
            subjectId: subject.id,
            shift: classGroup.shift,
            classGroupId: classGroup.id,
        });

        updateTag(`period:${period.id}:courses`);
        updateTag(`class-group:${classGroup.id}:courses`);
        updateTag(`period:${period.id}:class-group:${classGroup.slug}`);
        updateTag(`period:${period.id}:class-groups`);
        updateTag(`program-periods:${programSlug}`);
        revalidatePath(`/admin/${programSlug}/periodos/${periodSlug}/turmas/${classGroupSlug}/disciplinas`);
    } catch (error) {
        if (error instanceof ZodError) {
            return { success: false, error: error.issues[0]?.message || "Erro de validação" };
        }
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: "Erro ao adicionar disciplina na turma" };
    }

    const params = new URLSearchParams({
        toast: "success",
        message: "Disciplina adicionada com sucesso",
    });

    redirect(`/admin/${programSlug}/periodos/${periodSlug}/turmas/${classGroupSlug}/disciplinas?${params.toString()}`);
}
