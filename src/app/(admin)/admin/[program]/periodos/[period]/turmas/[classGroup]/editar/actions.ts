"use server";

import { updateCourse, getCourseByPeriodIdAndCode } from "@/services/courses/courses.service";
import { deleteCourse } from "@/services/courses/courses.service";
import { getPeriodByProgramAndSlug } from "@/services/periods/periods.service";
import { getClassGroupByPeriodIdAndSlug, getClassGroupSlugsByIds, updateClassGroup, deleteClassGroup } from "@/services/class-groups/class-groups.service";
import { ZodError, z } from "zod";
import { courseUpdateSchema, type CourseUpdateInput } from "../../schema";
import { revalidatePath, updateTag } from "next/cache";
import { DayOfWeek, Shift } from "@/generated/prisma/enums";
import { editClassGroupSchema, type EditClassGroupInput } from "./schema";

const deleteCourseSchema = z.object({
    confirmationName: z.string().min(1, "Digite o nome da disciplina para confirmar"),
});

const deleteClassGroupSchema = z.object({
    confirmationName: z.string().min(1, "Digite o nome da turma para confirmar"),
});

/**
 * Caches a invalidar:
 * - `getCoursesByClassGroupId` → `class-group:${id}:courses`
 * - `getClassGroupByPeriodIdAndSlug` (página `.../turmas/[slug]/disciplinas`) → `period:${periodId}:class-group:${slug}`
 * - `getClassGroupsByPeriodId` (contagem de turmas no card) → `period:${periodId}:class-groups`
 *
 * A omissão da tag `period:…:class-group:…` era a causa de a listagem de disciplinas continuar
 * com dados antigos após excluir/editar a turma.
 */
async function invalidateCachesForCourseClassGroups(
    periodId: string,
    classGroupIds: (string | null | undefined)[],
): Promise<string[]> {
    const uniqueIds = [...new Set(classGroupIds.filter((id): id is string => Boolean(id)))];
    for (const id of uniqueIds) {
        updateTag(`class-group:${id}:courses`);
    }
    const slugs = await getClassGroupSlugsByIds(uniqueIds);
    for (const slug of slugs) {
        updateTag(`period:${periodId}:class-group:${slug}`);
    }
    if (uniqueIds.length > 0) {
        updateTag(`period:${periodId}:class-groups`);
    }
    return slugs;
}

function revalidateTurmasRelatedPaths(
    programSlug: string,
    periodSlug: string,
    classGroupSlugs: string[],
) {
    for (const slug of classGroupSlugs) {
        revalidatePath(`/admin/${programSlug}/periodos/${periodSlug}/turmas/${slug}/disciplinas`);
    }
    revalidatePath(`/admin/${programSlug}/periodos/${periodSlug}/turmas`);
}

export async function updateCourseAction(
    programSlug: string,
    periodSlug: string,
    courseCode: string,
    data: CourseUpdateInput,
) {
    let redirectClassGroupId: string | undefined;
    try {
        const validatedData = courseUpdateSchema.parse(data);
        
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
            code: course.code,
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
        updateTag(`period:${course.periodId}:course:${course.code}`);
        updateTag(`program-periods:${programSlug}`);
        const classGroupSlugs = await invalidateCachesForCourseClassGroups(course.periodId, [
            course.classGroupId,
            validatedData.classGroupId || null,
        ]);
        revalidateTurmasRelatedPaths(programSlug, periodSlug, classGroupSlugs);
        redirectClassGroupId = validatedData.classGroupId || course.classGroupId || undefined;
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
    const [targetClassGroupSlug] = await getClassGroupSlugsByIds([redirectClassGroupId || ""]);

    if (targetClassGroupSlug) {
        return {
            success: true,
            redirectTo: `/admin/${programSlug}/periodos/${periodSlug}/turmas/${targetClassGroupSlug}/disciplinas?${params.toString()}`,
        };
    }

    return {
        success: true,
        redirectTo: `/admin/${programSlug}/periodos/${periodSlug}/turmas?${params.toString()}`,
    };
}

export async function deleteCourseAction(
    programSlug: string,
    periodSlug: string,
    courseCode: string,
    confirmationName: string,
) {
    let redirectClassGroupId: string | undefined;
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
        const classGroupSlugs = await invalidateCachesForCourseClassGroups(course.periodId, [
            course.classGroupId,
        ]);
        revalidateTurmasRelatedPaths(programSlug, periodSlug, classGroupSlugs);
        redirectClassGroupId = course.classGroupId || undefined;
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
    const [targetClassGroupSlug] = await getClassGroupSlugsByIds([redirectClassGroupId || ""]);

    if (targetClassGroupSlug) {
        return {
            success: true,
            redirectTo: `/admin/${programSlug}/periodos/${periodSlug}/turmas/${targetClassGroupSlug}/disciplinas?${params.toString()}`,
        };
    }

    return {
        success: true,
        redirectTo: `/admin/${programSlug}/periodos/${periodSlug}/turmas?${params.toString()}`,
    };
}

export async function updateClassGroupAction(
    programSlug: string,
    periodSlug: string,
    classGroupSlug: string,
    data: EditClassGroupInput,
) {
    try {
        const validatedData = editClassGroupSchema.parse(data);
        const period = await getPeriodByProgramAndSlug(programSlug, periodSlug);
        if (!period) {
            return { success: false, error: "Período não encontrado." };
        }

        const classGroup = await getClassGroupByPeriodIdAndSlug(period.id, classGroupSlug);
        if (!classGroup) {
            return { success: false, error: "Turma não encontrada." };
        }

        await updateClassGroup(classGroup.id, { 
            name: validatedData.name, 
            shift: validatedData.shift,
            groupLink: validatedData.groupLink,
        });

        updateTag(`period:${period.id}:class-groups`);
        updateTag(`period:${period.id}:class-group:${classGroupSlug}`);
        updateTag(`period:${period.id}:courses`); // Invalida pois o turno das disciplinas pode ter mudado
        revalidatePath(`/admin/${programSlug}/periodos/${periodSlug}/turmas`);
        revalidatePath(`/admin/${programSlug}/periodos/${periodSlug}/turmas/${classGroupSlug}/disciplinas`);
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
    return {
        success: true,
        redirectTo: `/admin/${programSlug}/periodos/${periodSlug}/turmas/${classGroupSlug}?${params.toString()}`,
    };
}

export async function deleteClassGroupAction(
    programSlug: string,
    periodSlug: string,
    classGroupSlug: string,
    confirmationName: string,
) {
    try {
        const validatedData = deleteClassGroupSchema.parse({ confirmationName });
        const period = await getPeriodByProgramAndSlug(programSlug, periodSlug);
        if (!period) {
            return { success: false, error: "Período não encontrado." };
        }

        const classGroup = await getClassGroupByPeriodIdAndSlug(period.id, classGroupSlug);
        if (!classGroup) {
            return { success: false, error: "Turma não encontrada." };
        }

        if (classGroup.name !== validatedData.confirmationName) {
            return { success: false, error: "O nome digitado não corresponde à turma" };
        }

        await deleteClassGroup(classGroup.id);

        updateTag(`period:${period.id}:class-groups`);
        updateTag(`period:${period.id}:courses`);
        revalidatePath(`/admin/${programSlug}/periodos/${periodSlug}/turmas`);
    } catch (error) {
        if (error instanceof ZodError) {
            return { success: false, error: error.issues[0]?.message || "Erro de validação" };
        }
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: "Erro ao apagar turma" };
    }

    const params = new URLSearchParams({
        toast: "success",
        message: "Turma apagada com sucesso",
    });

    return {
        success: true,
        redirectTo: `/admin/${programSlug}/periodos/${periodSlug}/turmas?${params.toString()}`,
    };
}
