import type { Period } from "@/generated/prisma/client";
import z from "zod";

export const createPeriodSchema = z
    .object({
        name: z.string().min(1, "Nome é obrigatório").min(3, "Nome deve ter no mínimo 3 caracteres"),
        slug: z
            .string()
            .min(1, "Slug é obrigatório")
            .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug deve conter apenas letras minúsculas, números e hífens"),
        startDate: z.coerce.date({ message: "Data de início é obrigatória" }),
        endDate: z.coerce.date({ message: "Data de término é obrigatória" }),
    })
    .refine((data) => data.endDate >= data.startDate, {
        message: "Data de término deve ser igual ou posterior à data de início",
        path: ["endDate"],
    });

export type CreatePeriodInput = Pick<Period, "name" | "slug" | "startDate" | "endDate">;