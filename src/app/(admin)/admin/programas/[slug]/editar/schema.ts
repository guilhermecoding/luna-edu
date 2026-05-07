import z from "zod";

export const editProgramSchema = z.object({
    name: z.string().min(1, "Nome é obrigatório").min(3, "Nome deve ter no mínimo 3 caracteres"),
    description: z.string().optional().default(""),
});

export type EditProgramInput = z.input<typeof editProgramSchema>;
export type EditProgramOutput = z.output<typeof editProgramSchema>;