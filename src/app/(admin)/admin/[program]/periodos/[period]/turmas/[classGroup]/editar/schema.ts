import { Shift } from "@/generated/prisma/enums";
import z from "zod";

export const editClassGroupSchema = z.object({
    name: z.string().min(2, "O nome deve ter no mínimo 2 caracteres"),
    shift: z.nativeEnum(Shift, { message: "O turno é obrigatório" }),
});

export type EditClassGroupInput = z.infer<typeof editClassGroupSchema>;
