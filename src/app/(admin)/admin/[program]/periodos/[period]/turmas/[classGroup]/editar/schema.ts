import z from "zod";

export const editClassGroupSchema = z.object({
    name: z.string().min(2, "O nome deve ter no mínimo 2 caracteres"),
});

export type EditClassGroupInput = z.infer<typeof editClassGroupSchema>;
