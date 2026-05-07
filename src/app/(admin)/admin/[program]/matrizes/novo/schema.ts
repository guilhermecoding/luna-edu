import z from "zod";

export const createDegreeSchema = z.object({
    name: z.string().min(1, "Nome é obrigatório").min(3, "O nome deve ter no mínimo 3 caracteres"),
    slug: z
        .string()
        .min(1, "Slug é obrigatório")
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug deve conter apenas minúsculas, números e hífens"),
    description: z.string().optional().default(""),
    modality: z.string().optional().default(""),
    level: z.string().optional().default(""),
    totalHours: z.coerce.number().min(0, "A carga horária não pode ser negativa").optional(),
});

export type CreateDegreeInput = z.infer<typeof createDegreeSchema>;
