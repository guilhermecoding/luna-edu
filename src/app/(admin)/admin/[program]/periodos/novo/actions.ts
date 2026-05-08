"use server";

import { createPeriod } from "@/services/periods/periods.service";
import { revalidatePath, updateTag } from "next/cache";
import { ZodError } from "zod";
import { createPeriodSchema, type CreatePeriodInput } from "./schema";

export async function createPeriodAction(programSlug: string, data: CreatePeriodInput) {
    try {
        const validatedData = createPeriodSchema.parse(data);
        await createPeriod(programSlug, validatedData);

        updateTag(`program:${programSlug}`);
        revalidatePath(`/admin/${programSlug}/periodos`);
        revalidatePath(`/admin/${programSlug}/periodos/novo`);
    } catch (error) {
        if (error instanceof ZodError) {
            return {
                success: false,
                error: error.issues[0]?.message || "Erro de validação",
            };
        }

        if (error instanceof Error) {
            return {
                success: false,
                error: error.message,
            };
        }

        return {
            success: false,
            error: "Erro ao criar período",
        };
    }

    const params = new URLSearchParams({
        toast: "success",
        message: "Período criado com sucesso",
    });

    return {
        success: true,
        redirectTo: `/admin/${programSlug}/periodos?${params.toString()}`,
    };
}