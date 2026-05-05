import { z } from "zod";
import { isValidDate } from "@/lib/date-utils";

export const studentSchema = z.object({
    name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres").max(255, "Nome muito longo"),
    email: z.string().email("E-mail inválido").max(255, "E-mail muito longo"),
    cpf: z.string().min(11, "CPF inválido").max(14, "CPF inválido"),
    studentPhone: z.string().min(10, "Telefone inválido").max(15, "Telefone muito longo"),
    parentPhone: z.string().min(10, "Telefone inválido").max(15, "Telefone muito longo").optional().or(z.literal("")),
    birthDate: z.date({
        error(issue) {
            if (issue.code === "invalid_type" && issue.input === undefined) {
                return { message: "Data de nascimento é obrigatória" };
            }
            if (issue.code === "invalid_type") {
                return { message: "Data inválida" };
            }
            return { message: "Data inválida" };
        },
    }).refine((date) => isValidDate(date), {
        message: "Data de nascimento inválida",
    }),
    genre: z.enum(["MALE", "FEMALE", "NON_BINARY", "PREFER_NOT_TO_SAY"], { 
        message: "Gênero inválido" ,
    }),
    school: z.string().min(2, "O nome da escola de origem deve ter no mínimo 2 caracteres").max(255, "Nome muito longo"),
});

export const createStudentSchema = studentSchema;

export const editStudentSchema = studentSchema.extend({
    lunaId: z.string().optional().or(z.literal("")),
});

export type CreateStudentInput = z.input<typeof createStudentSchema>;
export type CreateStudentData = z.infer<typeof createStudentSchema>;

export type EditStudentInput = z.input<typeof editStudentSchema>;
export type EditStudentData = z.infer<typeof editStudentSchema>;
