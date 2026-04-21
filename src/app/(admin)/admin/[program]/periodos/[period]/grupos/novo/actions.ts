"use server";

import { createClassGroup } from "@/services/class-groups/class-groups.service";
import { getPeriodByProgramAndSlug } from "@/services/periods/periods.service";
import { ZodError } from "zod";
import { classGroupSchema, type ClassGroupInput } from "../schema";
import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { Shift } from "@/generated/prisma/client";

export async function createClassGroupAction(
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
        });

        updateTag(`period:${period.id}:class-groups`);
        updateTag(`period:${period.id}:courses`);
        revalidatePath(`/admin/${programSlug}/periodos/${periodSlug}/grupos`);
        revalidatePath(`/admin/${programSlug}/periodos/${periodSlug}/turmas`);
    } catch (error) {
        if (error instanceof ZodError) {
            return { success: false, error: error.issues[0]?.message || "Erro de validação" };
        }
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: "Erro ao criar grupo" };
    }

    const params = new URLSearchParams({
        toast: "success",
        message: "Grupo criado com sucesso! Turmas geradas automaticamente.",
    });

    redirect(`/admin/${programSlug}/periodos/${periodSlug}/grupos?${params.toString()}`);
}
