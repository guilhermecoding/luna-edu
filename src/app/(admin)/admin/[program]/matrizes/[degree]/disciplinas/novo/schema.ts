import z from "zod";

export const createSubjectSchema = z.object({
    name: z.string().min(1, "Nome é obrigatório").min(2, "Nome deve ter no mínimo 2 caracteres"),
    code: z.string().min(1, "Código Interno Único é obrigatório").transform(val => val.toUpperCase()),
    workload: z.coerce.number().min(1, "A carga horária não pode ser negativa ou zero").optional(),
    basePeriod: z.coerce.number().min(1, "O período deve ser maior que 0"),
});

export type CreateSubjectInput = z.infer<typeof createSubjectSchema>;
