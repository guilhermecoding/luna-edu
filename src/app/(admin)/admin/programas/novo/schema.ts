import type { Program } from "@/generated/prisma/client";
import z from "zod";

export const createProgramSchema = z.object({
    name: z.string().min(1, "Nome é obrigatório").min(3, "Nome deve ter no mínimo 3 caracteres"),
    description: z.string().optional().default(""),
    slug: z
        .string()
        .min(1, "Slug é obrigatório")
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug deve conter apenas letras minúsculas, números e hífens"),
});

export type CreateProgramInput = Pick<Program, "name" | "slug"> & {
    description: NonNullable<Program["description"]>;
};