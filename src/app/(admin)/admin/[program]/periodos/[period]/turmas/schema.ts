import { z } from "zod";

export const SHIFTS = ["MORNING", "AFTERNOON", "EVENING"] as const;

export const shiftLabels: Record<(typeof SHIFTS)[number], string> = {
    MORNING: "Manhã",
    AFTERNOON: "Tarde",
    EVENING: "Noite",
};

export const DAYS_OF_WEEK = [
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY",
] as const;

export const dayOfWeekLabels: Record<(typeof DAYS_OF_WEEK)[number], string> = {
    MONDAY: "Segunda",
    TUESDAY: "Terça",
    WEDNESDAY: "Quarta",
    THURSDAY: "Quinta",
    FRIDAY: "Sexta",
    SATURDAY: "Sábado",
    SUNDAY: "Domingo",
};

export const dayOfWeekShortLabels: Record<(typeof DAYS_OF_WEEK)[number], string> = {
    MONDAY: "Seg",
    TUESDAY: "Ter",
    WEDNESDAY: "Qua",
    THURSDAY: "Qui",
    FRIDAY: "Sex",
    SATURDAY: "Sáb",
    SUNDAY: "Dom",
};

export const scheduleEntrySchema = z.object({
    dayOfWeek: z.enum(DAYS_OF_WEEK, {
        message: "Selecione o dia da semana",
    }),
    timeSlotId: z.string().min(1, "Selecione o horário"),
    teacherId: z.string().optional().or(z.literal("")),
    roomId: z.string().optional().or(z.literal("")),
});

export const courseSchema = z.object({
    name: z.string().min(2, "O nome deve ter no mínimo 2 caracteres"),
    code: z.string()
        .min(2, "O código deve ter no mínimo 2 caracteres")
        .regex(/^[a-zA-Z0-9-]+$/, "O código deve conter apenas letras, números e hífens"),
    subjectId: z.string().min(1, "Selecione uma disciplina"),
    roomId: z.string().optional().or(z.literal("")),
    shift: z.enum(SHIFTS, {
        message: "Selecione um turno",
    }),
    classGroupId: z.string().optional().or(z.literal("")),
    schedules: z.array(scheduleEntrySchema).default([]),
});

export type ScheduleEntryInput = z.infer<typeof scheduleEntrySchema>;
export type CourseInput = z.output<typeof courseSchema>;

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

