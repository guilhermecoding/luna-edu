"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { ZodError, z } from "zod";
import { deleteProgram, getProgramBySlug, updateProgram } from "@/services/programs/programs.service";
import { editProgramSchema, type EditProgramInput } from "./schema";

const deleteProgramSchema = z.object({
    confirmationName: z.string().min(1, "Digite o nome do programa para confirmar"),
});

export async function editProgramAction(slug: string, data: EditProgramInput) {
    try {
        const validatedData = editProgramSchema.parse(data);
        await updateProgram(slug, validatedData);

        updateTag("programs:list");
        updateTag(`program:${slug}`);
        revalidatePath("/admin/programas");
        revalidatePath(`/admin/programas/${slug}/editar`);
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

    redirect("/admin/programas");
}

export async function deleteProgramAction(slug: string, confirmationName: string) {
    try {
        const validatedData = deleteProgramSchema.parse({ confirmationName });
        const program = await getProgramBySlug(slug);

        if (!program) {
            return {
                success: false,
                error: "Programa não encontrado",
            };
        }

        if (program.name !== validatedData.confirmationName) {
            return {
                success: false,
                error: "O nome digitado não corresponde ao programa",
            };
        }

        await deleteProgram(slug);

        updateTag("programs:list");
        updateTag(`program:${slug}`);
        revalidatePath("/admin/programas");
        revalidatePath(`/admin/programas/${slug}/editar`);
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
            error: "Erro ao apagar programa",
        };
    }

    redirect("/admin/programas");
}