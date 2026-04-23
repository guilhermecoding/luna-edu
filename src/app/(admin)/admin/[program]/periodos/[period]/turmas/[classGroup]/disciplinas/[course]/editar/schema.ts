import z from "zod";
import { scheduleEntrySchema, SHIFTS } from "../../../../../turmas/schema";

export const editClassGroupCourseSchema = z.object({
    subjectId: z.string().min(1, "Selecione uma disciplina"),
    name: z.string().min(2, "O nome deve ter no mínimo 2 caracteres"),
    shift: z.enum(SHIFTS, {
        message: "Selecione um turno",
    }),
    roomId: z.string().optional().or(z.literal("")),
    schedules: z.array(scheduleEntrySchema).default([]),
});

export const deleteClassGroupCourseSchema = z.object({
    confirmationName: z.string().min(1, "Digite o nome da disciplina para confirmar"),
});

export type EditClassGroupCourseInput = z.infer<typeof editClassGroupCourseSchema>;
