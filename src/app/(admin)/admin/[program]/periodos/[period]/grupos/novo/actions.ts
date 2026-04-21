"use server";

import { createClassGroup } from "@/services/class-groups/class-groups.service";
import { getPeriodByProgramAndSlug } from "@/services/periods/periods.service";
import { ZodError } from "zod";
import { classGroupSchema, type ClassGroupInput } from "../schema";
import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";

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
        });

        updateTag(`period:${period.id}:class-groups`);
        revalidatePath(`/admin/${programSlug}/periodos/${periodSlug}/grupos`);
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
        message: "Grupo criado com sucesso",
    });

    redirect(`/admin/${programSlug}/periodos/${periodSlug}/grupos?${params.toString()}`);
}
