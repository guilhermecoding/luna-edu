import z from "zod";

export const editMemberSchema = z.object({
    name: z.string().min(1, "Nome é obrigatório"),
    cpf: z.string().min(11, "CPF inválido"),
    email: z.string().email("E-mail inválido"),
    phone: z.string().min(10, "Telefone inválido"),
    birthDate: z.coerce.date({ message: "Data de nascimento inválida" }).refine((date) => date <= new Date(), { message: "A data de nascimento não pode ser no futuro" }),
    genre: z.enum(["MALE", "FEMALE", "NON_BINARY", "PREFER_NOT_TO_SAY"], { message: "Gênero inválido" }),
    systemRole: z.enum(["FULL_ACCESS", "READ_ONLY"], { message: "Nível de acesso inválido" }),
    isAdmin: z.boolean(),
    isTeacher: z.boolean(),
    isActive: z.boolean(),
    password: z.string().min(8, "A senha deve ter no mínimo 8 caracteres").optional().or(z.literal("")),
    confirmPassword: z.string().optional().or(z.literal("")),
}).superRefine(({ password, confirmPassword }, ctx) => {
    if (password && password !== confirmPassword) {
        ctx.addIssue({
            code: "custom",
            message: "As senhas não coincidem",
            path: ["confirmPassword"],
        });
    }
});

export type EditMemberInput = z.input<typeof editMemberSchema>;
export type EditMemberData = z.output<typeof editMemberSchema>;
