import z from "zod";

export const createTeacherSchema = z.object({
    name: z.string().min(1, "Nome é obrigatório"),
    email: z.string().email("E-mail inválido"),
    cpf: z.string().min(11, "CPF inválido").max(14, "CPF inválido"),
    phone: z.string().min(10, "Telefone inválido"),
    birthDate: z.coerce.date({ message: "Data de nascimento inválida" }).refine((date) => date <= new Date(), { message: "A data de nascimento não pode ser no futuro" }),
    genre: z.enum(["MALE", "FEMALE", "NON_BINARY", "PREFER_NOT_TO_SAY"], { message: "Gênero inválido" }),
    systemRole: z.enum(["FULL_ACCESS", "READ_ONLY"], { message: "Nível de acesso inválido" }),
});

export type CreateTeacherInput = z.input<typeof createTeacherSchema>;
export type CreateTeacherData = z.output<typeof createTeacherSchema>;

export const promoteAdminSchema = z.object({
    adminId: z.string().min(1, "Administrador inválido"),
    systemRole: z.enum(["FULL_ACCESS", "READ_ONLY"], { message: "Nível de acesso inválido" }),
});

export type PromoteAdminInput = z.infer<typeof promoteAdminSchema>;
