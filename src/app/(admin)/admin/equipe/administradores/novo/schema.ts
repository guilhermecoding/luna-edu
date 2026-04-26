import z from "zod";

export const createAdminSchema = z.object({
    name: z.string().min(1, "Nome é obrigatório"),
    email: z.string().email("E-mail inválido"),
    cpf: z.string().min(11, "CPF inválido").max(14, "CPF inválido"),
    phone: z.string().min(10, "Telefone inválido"),
    birthDate: z.coerce.date({ message: "Data de nascimento inválida" }).refine((date) => date <= new Date(), { message: "A data de nascimento não pode ser no futuro" }),
    genre: z.enum(["MALE", "FEMALE", "NON_BINARY", "PREFER_NOT_TO_SAY"], { message: "Gênero inválido" }),
    systemRole: z.enum(["FULL_ACCESS", "READ_ONLY"], { message: "Nível de acesso inválido" }),
});

export type CreateAdminInput = z.input<typeof createAdminSchema>;
export type CreateAdminData = z.output<typeof createAdminSchema>;

export const promoteTeacherSchema = z.object({
    teacherId: z.string().uuid("Professor inválido"),
    systemRole: z.enum(["FULL_ACCESS", "READ_ONLY"], { message: "Nível de acesso inválido" }),
});

export type PromoteTeacherInput = z.infer<typeof promoteTeacherSchema>;
