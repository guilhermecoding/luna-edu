import { z } from "zod";
import { SHIFTS } from "../periodos/[period]/turmas/schema";

export const timeSlotSchema = z.object({
    name: z.string().min(2, "O nome deve ter no mínimo 2 caracteres"),
    startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Formato inválido (HH:MM)"),
    endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Formato inválido (HH:MM)"),
    shift: z.enum(SHIFTS, {
        message: "Selecione um turno",
    }),
});

export type TimeSlotInput = z.input<typeof timeSlotSchema>;
export type TimeSlotOutput = z.output<typeof timeSlotSchema>;
