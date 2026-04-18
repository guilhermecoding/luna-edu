import { z } from "zod";

export const ROOM_TYPES = ["CLASSROOM", "LABORATORY", "AUDITORIUM", "OTHERS"] as const;

export const roomTypeLabels: Record<(typeof ROOM_TYPES)[number], string> = {
    CLASSROOM: "Sala de Aula",
    LABORATORY: "Laboratório",
    AUDITORIUM: "Auditório",
    OTHERS: "Outros",
};

export const roomSchema = z.object({
    name: z.string().min(2, "O nome deve ter no mínimo 2 caracteres"),
    capacity: z
        .string()
        .min(1, "A capacidade é obrigatória")
        .refine((val) => !isNaN(Number(val)) && Number(val) >= 1, {
            message: "A capacidade deve ser um número maior que 0",
        }),
    block: z.string().optional(),
    type: z.enum(ROOM_TYPES, {
        message: "O tipo da sala é obrigatório",
    }),
    slug: z
        .string()
        .min(2, "O slug deve ter no mínimo 2 caracteres")
        .regex(/^[a-z0-9-]+$/, "Apenas letras minúsculas, números e hifens são permitidos"),
});

export type RoomInput = z.infer<typeof roomSchema>;

