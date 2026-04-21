import { z } from "zod";

export const subPeriodSchema = z.object({
    name: z.string().min(2, "O nome deve ter no mínimo 2 caracteres"),
    slug: z.string()
        .min(2, "O código deve ter no mínimo 2 caracteres")
        .regex(/^[a-zA-Z0-9-]+$/, "O código deve conter apenas letras, números e hífens"),
    order: z.coerce.number().int().min(1, "A ordem deve ser no mínimo 1"),
    startDate: z.string().min(1, "Data de início é obrigatória"),
    endDate: z.string().min(1, "Data de fim é obrigatória"),
    weight: z.coerce.number().min(0.1, "O peso deve ser no mínimo 0.1").default(1.0),
});

export type SubPeriodInput = z.output<typeof subPeriodSchema>;
