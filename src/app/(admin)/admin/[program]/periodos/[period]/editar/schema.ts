import z from "zod";

export const editPeriodSchema = z
    .object({
        name: z.string().min(1, "Nome é obrigatório").min(3, "Nome deve ter no mínimo 3 caracteres"),
        startDate: z.coerce.date({ message: "Data de início é obrigatória" }),
        endDate: z.coerce.date({ message: "Data de término é obrigatória" }),
        status: z.enum(["active", "completed"]),
    })
    .refine((data) => data.endDate >= data.startDate, {
        message: "Data de término deve ser igual ou posterior à data de início",
        path: ["endDate"],
    });

export type EditPeriodInput = z.input<typeof editPeriodSchema>;
