"use server";

import { createSubPeriod } from "@/services/sub-periods/sub-periods.service";
import { getPeriodByProgramAndSlug } from "@/services/periods/periods.service";
import { ZodError } from "zod";
import { subPeriodSchema, type SubPeriodInput } from "../schema";
import { revalidatePath, updateTag } from "next/cache";

export async function createSubPeriodAction(
    programSlug: string,
    periodSlug: string,
    data: SubPeriodInput,
) {
    try {
        const validatedData = subPeriodSchema.parse(data);
        const period = await getPeriodByProgramAndSlug(programSlug, periodSlug);

        if (!period) {
            throw new Error("Período não encontrado.");
        }

        await createSubPeriod({
            name: validatedData.name,
            slug: validatedData.slug,
            order: validatedData.order,
            startDate: new Date(validatedData.startDate),
            endDate: new Date(validatedData.endDate),
            weight: validatedData.weight,
            periodId: period.id,
        });

        updateTag(`period:${period.id}:sub-periods`);
        updateTag(`period:${programSlug}:${periodSlug}`);
        revalidatePath(`/admin/${programSlug}/periodos/${periodSlug}/etapas`);
    } catch (error) {
        if (error instanceof ZodError) {
            return { success: false, error: error.issues[0]?.message || "Erro de validação" };
        }
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: "Erro ao criar etapa" };
    }

    const params = new URLSearchParams({
        toast: "success",
        message: "Etapa criada com sucesso",
    });

    return {
        success: true,
        redirectTo: `/admin/${programSlug}/periodos/${periodSlug}/etapas?${params.toString()}`,
    };
}
