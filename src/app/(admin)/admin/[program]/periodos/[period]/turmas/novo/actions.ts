"use server";

import { createClassGroup } from "@/services/class-groups/class-groups.service";
import { getPeriodByProgramAndSlug } from "@/services/periods/periods.service";
import { ZodError } from "zod";
import { classGroupSchema, type ClassGroupInput } from "../schema";
import { revalidatePath, updateTag } from "next/cache";
import { Shift } from "@/generated/prisma/client";

export async function createClassAction(
    programSlug: string,
    periodSlug: string,
    data: ClassGroupInput,
) {
    try {
        const validatedData = classGroupSchema.parse(data);
        const period = await getPeriodByProgramAndSlug(programSlug, periodSlug);

        if (!period) {
            throw new Error("Período não encontrado.");
        }

        await createClassGroup({
            name: validatedData.name,
            slug: validatedData.slug,
            periodId: period.id,
            degreeId: validatedData.degreeId,
            basePeriod: validatedData.basePeriod,
            shift: validatedData.shift as Shift,
            groupLink: validatedData.groupLink,
        });

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
        return { success: false, error: "Erro ao criar classe" };
    }

    const params = new URLSearchParams({
        toast: "success",
        message: "Classe criada com sucesso! As disciplinas foram geradas automaticamente.",
    });

    return {
        success: true,
        redirectTo: `/admin/${programSlug}/periodos/${periodSlug}/turmas?${params.toString()}`,
    };
}
