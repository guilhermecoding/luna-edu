"use server";

import { createTimeSlot } from "@/services/courses/schedules.service";
import { getProgramBySlug } from "@/services/programs/programs.service";
import { ZodError } from "zod";
import { timeSlotSchema, type TimeSlotInput } from "./schema";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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

        revalidatePath(`/admin/${programSlug}/horarios`);
    } catch (error) {
        if (error instanceof ZodError) {
            return { success: false, error: error.issues[0]?.message || "Erro de validação" };
        }
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: "Erro ao criar horário" };
    }

    redirect(`/admin/${programSlug}/horarios?toast=success&message=Horário criado com sucesso`);
}
