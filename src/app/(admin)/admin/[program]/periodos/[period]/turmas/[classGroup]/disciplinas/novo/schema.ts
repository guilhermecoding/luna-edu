import z from "zod";

export const createClassGroupSubjectSchema = z.object({
    subjectId: z.string().min(1, "Selecione uma disciplina"),
});

export type CreateClassGroupSubjectInput = z.infer<typeof createClassGroupSubjectSchema>;
