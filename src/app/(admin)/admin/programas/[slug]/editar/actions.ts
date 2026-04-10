"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { ZodError } from "zod";
import { updateProgram } from "@/services/programs/programs.service";
import { editProgramSchema, type EditProgramInput } from "./schema";

export async function editProgramAction(slug: string, data: EditProgramInput) {
    try {
        const validatedData = editProgramSchema.parse(data);
        const program = await updateProgram(slug, validatedData);

        revalidateTag("programs", "weeks");
        revalidatePath("/admin/programas");
        revalidatePath(`/admin/programas/${slug}/editar`);

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
            error: "Erro ao atualizar programa",
        };
    }
}