import { z } from "zod";

export const createLessonSchema = z.object({
    date: z.string().min(1, "Data é obrigatória"),
    topic: z.string().min(2, "O assunto deve ter no mínimo 2 caracteres").max(500, "Assunto muito longo"),
    teacherId: z.string().optional().or(z.literal("")),
    timeSlotId: z.string().optional().or(z.literal("")),
    scheduleId: z.string().optional().or(z.literal("")),
});

export type CreateLessonInput = z.infer<typeof createLessonSchema>;

export const updateLessonSchema = z.object({
    lessonId: z.string().min(1, "ID da aula é obrigatório"),
    date: z.string().min(1, "Data é obrigatória"),
    topic: z.string().min(2, "O assunto deve ter no mínimo 2 caracteres").max(500, "Assunto muito longo"),
    teacherId: z.string().optional().or(z.literal("")),
    timeSlotId: z.string().optional().or(z.literal("")),
    scheduleId: z.string().optional().or(z.literal("")),
});

export type UpdateLessonInput = z.infer<typeof updateLessonSchema>;

export const updateAttendanceSchema = z.object({
    attendanceId: z.string().min(1),
    isPresent: z.boolean(),
    observation: z.string().max(500).optional().or(z.literal("")),
});

export type UpdateAttendanceInput = z.infer<typeof updateAttendanceSchema>;

export const bulkUpdateAttendanceSchema = z.object({
    updates: z.array(z.object({
        id: z.string().min(1),
        isPresent: z.boolean(),
        observation: z.string().max(500).optional().or(z.literal("")),
    })),
});

export type BulkUpdateAttendanceInput = z.infer<typeof bulkUpdateAttendanceSchema>;
