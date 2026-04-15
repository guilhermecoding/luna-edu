"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { ZodError, z } from "zod";
import {
    deletePeriod,
    getPeriodByProgramAndSlug,
    updatePeriodStatus,
    updatePeriod,
} from "@/services/periods/periods.service";
import { editPeriodSchema, type EditPeriodInput } from "./schema";

const deletePeriodSchema = z.object({
    confirmationName: z.string().min(1, "Digite o nome do período para confirmar"),
});

const updatePeriodStatusSchema = z.object({
    status: z.enum(["active", "completed"]),
});

export async function editPeriodAction(
    programSlug: string,
    periodSlug: string,
    data: EditPeriodInput,
) {
    try {
        const validatedData = editPeriodSchema.parse(data);
        await updatePeriod(programSlug, periodSlug, validatedData);

        updateTag(`program:${programSlug}`);
        updateTag(`program-periods:${programSlug}`);
        updateTag(`period:${programSlug}:${periodSlug}`);
        revalidatePath(`/admin/${programSlug}/periodos`);
        revalidatePath(`/admin/${programSlug}/periodos/${periodSlug}/editar`);
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
            error: "Erro ao atualizar período",
        };
    }

    const params = new URLSearchParams({
        toast: "success",
        message: "Período atualizado com sucesso",
    });

    redirect(`/admin/${programSlug}/periodos?${params.toString()}`);
}

export async function deletePeriodAction(
    programSlug: string,
    periodSlug: string,
    confirmationName: string,
) {
    try {
        const validatedData = deletePeriodSchema.parse({ confirmationName });
        const period = await getPeriodByProgramAndSlug(programSlug, periodSlug);

        if (!period) {
            return {
                success: false,
                error: "Período não encontrado",
            };
        }

        if (period.name !== validatedData.confirmationName) {
            return {
                success: false,
                error: "O nome digitado não corresponde ao período",
            };
        }

        await deletePeriod(programSlug, periodSlug);

        updateTag(`program:${programSlug}`);
        updateTag(`program-periods:${programSlug}`);
        updateTag(`period:${programSlug}:${periodSlug}`);
        revalidatePath(`/admin/${programSlug}/periodos`);
        revalidatePath(`/admin/${programSlug}/periodos/${periodSlug}/editar`);
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
            error: "Erro ao apagar período",
        };
    }

    const params = new URLSearchParams({
        toast: "success",
        message: "Período apagado com sucesso",
    });

    redirect(`/admin/${programSlug}/periodos?${params.toString()}`);
}

export async function updatePeriodStatusAction(
    programSlug: string,
    periodSlug: string,
    status: "active" | "completed",
) {
    try {
        const validatedData = updatePeriodStatusSchema.parse({ status });
        await updatePeriodStatus(programSlug, periodSlug, validatedData.status);

        updateTag(`program:${programSlug}`);
        updateTag(`program-periods:${programSlug}`);
        updateTag(`period:${programSlug}:${periodSlug}`);
        revalidatePath(`/admin/${programSlug}/periodos`);
        revalidatePath(`/admin/${programSlug}/periodos/${periodSlug}/editar`);

        return {
            success: true,
        };
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
            error: "Erro ao atualizar status do período",
        };
    }
}
