import { z } from "zod";

export const SHIFTS = ["MORNING", "AFTERNOON", "EVENING"] as const;

export const shiftLabels: Record<(typeof SHIFTS)[number], string> = {
    MORNING: "Manhã",
    AFTERNOON: "Tarde",
    EVENING: "Noite",
};

export const courseSchema = z.object({
    name: z.string().min(2, "O nome deve ter no mínimo 2 caracteres"),
    subjectId: z.string().min(1, "Selecione uma disciplina"),
    roomId: z.string().min(1, "Selecione uma sala"),
    shift: z.enum(SHIFTS, {
        message: "Selecione um turno",
    }),
});

export type CourseInput = z.infer<typeof courseSchema>;
