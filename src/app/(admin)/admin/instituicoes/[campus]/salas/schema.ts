import { z } from "zod";

export const roomSchema = z.object({
    name: z.string().min(2, "O nome deve ter no mínimo 2 caracteres"),
    capacity: z
        .string()
        .min(1, "A capacidade é obrigatória")
        .refine((val) => !isNaN(Number(val)) && Number(val) >= 1, {
            message: "A capacidade deve ser um número maior que 0",
        }),
    block: z.string().optional(),
    slug: z
        .string()
        .min(2, "O slug deve ter no mínimo 2 caracteres")
        .regex(/^[a-z0-9-]+$/, "Apenas letras minúsculas, números e hifens são permitidos"),
});

export type RoomInput = z.infer<typeof roomSchema>;

