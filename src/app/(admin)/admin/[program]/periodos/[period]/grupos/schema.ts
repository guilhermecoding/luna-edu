import { z } from "zod";

const SHIFTS = ["MORNING", "AFTERNOON", "EVENING"] as const;

export const shiftLabels: Record<(typeof SHIFTS)[number], string> = {
    MORNING: "Manhã",
    AFTERNOON: "Tarde",
    EVENING: "Noite",
};

export const classGroupSchema = z.object({
    name: z.string().min(2, "O nome deve ter no mínimo 2 caracteres"),
    slug: z.string()
        .min(2, "O código deve ter no mínimo 2 caracteres")
        .regex(/^[a-zA-Z0-9-]+$/, "O código deve conter apenas letras, números e hífens"),
    degreeId: z.string().min(1, "Selecione uma matriz curricular"),
    basePeriod: z.coerce.number().int().min(1, "Selecione a série"),
    shift: z.enum(SHIFTS, {
        message: "Selecione um turno",
    }),
});

export type ClassGroupInput = z.output<typeof classGroupSchema>;
