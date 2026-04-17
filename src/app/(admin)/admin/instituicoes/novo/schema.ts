import z from "zod";

export const createCampusSchema = z.object({
    name: z.string().min(1, "O nome é obrigatório"),
    address: z.string().min(1, "O endereço é obrigatório"),
});

export type CreateCampusInput = z.infer<typeof createCampusSchema>;
