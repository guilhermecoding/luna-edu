import { z } from "zod";
import { SHIFTS } from "../periodos/[period]/turmas/schema";

export const timeSlotSchema = z.object({
    name: z.string().min(2, "O nome deve ter no mínimo 2 caracteres"),
    startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Formato inválido (HH:MM)"),
    endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Formato inválido (HH:MM)"),
    shift: z.enum(SHIFTS, {
        message: "Selecione um turno",
    }),
}).refine((data) => {
    const [startH, startM] = data.startTime.split(":").map(Number);
    const [endH, endM] = data.endTime.split(":").map(Number);

    if (isNaN(startH) || isNaN(endH)) return true; // Deixa o regex tratar se estiver incompleto

    const startTimeInMinutes = startH * 60 + startM;
    const endTimeInMinutes = endH * 60 + endM;

    return startTimeInMinutes < endTimeInMinutes;
}, {
    message: "O horário de início deve ser anterior ao horário de término",
    path: ["endTime"],
});

export type TimeSlotInput = z.input<typeof timeSlotSchema>;
export type TimeSlotOutput = z.output<typeof timeSlotSchema>;
