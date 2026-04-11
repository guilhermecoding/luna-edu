"use server";

import { createProgram } from "@/services/programs/programs.service";
import { ZodError } from "zod";
import { createProgramSchema, type CreateProgramInput } from "./schema";
import { revalidatePath, updateTag } from "next/cache";

export async function createProgramAction(data: CreateProgramInput) {
    try {
        const validatedData = createProgramSchema.parse(data);
        const program = await createProgram(validatedData);

        updateTag("programs");
        revalidatePath("/admin/programas");

        return { success: true, data: program };
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
            error: "Erro ao criar programa",
        };
    }
}
