"use server";

import { createTimeSlot, updateTimeSlot, deleteTimeSlot } from "@/services/schedules/schedules.service";
import { getProgramBySlug } from "@/services/programs/programs.service";
import { ZodError } from "zod";
import { timeSlotSchema, type TimeSlotInput } from "./schema";
import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@/generated/prisma/client";

export async function createTimeSlotAction(
    programSlug: string,
    data: TimeSlotInput,
) {
    try {
        const validatedData = timeSlotSchema.parse(data);
        const program = await getProgramBySlug(programSlug);

        if (!program) {
            throw new Error("Programa não encontrado.");
        }

        await createTimeSlot({
            ...validatedData,
            programId: program.id,
        });

        updateTag(`program:${programSlug}:time-slots`);
        revalidatePath(`/admin/${programSlug}/horarios`);
    } catch (error) {
        if (error instanceof ZodError) {
            return { success: false, error: error.issues[0]?.message || "Erro de validação" };
        }

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2002") {
                return { success: false, error: "Já existe um horário começando neste mesmo horário." };
            }
        }

        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: "Erro ao criar horário" };
    }

    redirect(`/admin/${programSlug}/horarios?toast=success&message=${encodeURIComponent("Horário criado com sucesso")}`);
}

export async function editTimeSlotAction(
    id: string,
    programSlug: string,
    data: TimeSlotInput,
) {
    try {
        const validatedData = timeSlotSchema.parse(data);

        await updateTimeSlot(id, validatedData);

        updateTag(`program:${programSlug}:time-slots`);
        updateTag(`time-slot:${id}`);
        revalidatePath(`/admin/${programSlug}/horarios`);
    } catch (error) {
        if (error instanceof ZodError) {
            return { success: false, error: error.issues[0]?.message || "Erro de validação" };
        }

        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: "Erro ao atualizar horário" };
    }

    redirect(`/admin/${programSlug}/horarios?toast=success&message=${encodeURIComponent("Horário atualizado com sucesso")}`);
}

export async function deleteTimeSlotAction(
    id: string,
    programSlug: string,
) {
    try {
        await deleteTimeSlot(id);

        updateTag(`program:${programSlug}:time-slots`);
        revalidatePath(`/admin/${programSlug}/horarios`);
    } catch (error) {
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: "Erro ao excluir horário" };
    }

    redirect(`/admin/${programSlug}/horarios?toast=success&message=${encodeURIComponent("Horário excluído com sucesso")}`);
}
