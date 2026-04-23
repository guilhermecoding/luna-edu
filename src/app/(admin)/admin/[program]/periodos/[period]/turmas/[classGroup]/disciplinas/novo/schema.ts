import z from "zod";
import { scheduleEntrySchema, SHIFTS } from "../../../schema";

export const createClassGroupSubjectSchema = z.object({
    subjectId: z.string().min(1, "Selecione uma disciplina"),
    name: z.string().min(2, "O nome deve ter no mínimo 2 caracteres"),
    code: z.string()
        .min(2, "O código deve ter no mínimo 2 caracteres")
        .regex(/^[a-zA-Z0-9-]+$/, "O código deve conter apenas letras, números e hífens")
        .transform((value) => value.toUpperCase()),
    shift: z.enum(SHIFTS, {
        message: "Selecione um turno",
    }),
    roomId: z.string().optional().or(z.literal("")),
    schedules: z.array(scheduleEntrySchema).default([]),
});

export type CreateClassGroupSubjectInput = z.infer<typeof createClassGroupSubjectSchema>;
