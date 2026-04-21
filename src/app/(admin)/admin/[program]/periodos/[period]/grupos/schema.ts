import { z } from "zod";

export const classGroupSchema = z.object({
    name: z.string().min(2, "O nome deve ter no mínimo 2 caracteres"),
    slug: z.string()
        .min(2, "O código deve ter no mínimo 2 caracteres")
        .regex(/^[a-zA-Z0-9-]+$/, "O código deve conter apenas letras, números e hífens"),
});

export type ClassGroupInput = z.output<typeof classGroupSchema>;
