"use server";

import { updateTag } from "next/cache";
import { createStudentSchema, editStudentSchema, importStudentRowSchema, type CreateStudentData, type EditStudentData } from "./schema";
import { createStudent, updateStudent } from "@/services/students/students.service";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Genre, Prisma } from "@/generated/prisma/client";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export async function createStudentAction(data: CreateStudentData, periodId?: string, redirectPath: string = "/admin/alunos") {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        const actorId = session?.user?.id;

        if (!actorId) {
            return { success: false, error: "Não autorizado" };
        }

        const parsedData = createStudentSchema.parse(data);

        await createStudent({
            name: parsedData.name,
            email: parsedData.email,
            cpf: parsedData.cpf,
            studentPhone: parsedData.studentPhone,
            parentPhone: parsedData.parentPhone || null,
            birthDate: parsedData.birthDate,
            genre: parsedData.genre,
            school: parsedData.school,
        }, periodId);

        updateTag("students-list");
        updateTag("students-count");
        if (periodId) {
            updateTag(`period:${periodId}:students-list`);
            updateTag(`period:${periodId}:students-count`);
        }

    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2002") {
                const target = JSON.stringify(error.meta?.target || "").toLowerCase();
                const message = error.message.toLowerCase();

                if (target.includes("email") || message.includes("email")) {
                    return { success: false, error: "Este e-mail já está em uso por outro aluno." };
                }
                if (target.includes("cpf") || message.includes("cpf")) {
                    return { success: false, error: "Este CPF já está em uso por outro aluno." };
                }
                
                return { success: false, error: "Conflito de dados: Um aluno com estes dados já existe." };
            }
        }
        if (isRedirectError(error)) throw error;
        
        console.error("Erro ao criar aluno:", error);
        return { success: false, error: "Ocorreu um erro inesperado ao criar o aluno." };
    }
    if (redirectPath !== "none") {
        redirect(redirectPath);
    }

    return { success: true };
}

export async function editStudentAction(id: string, data: EditStudentData) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        const actorId = session?.user?.id;

        if (!actorId) {
            return { success: false, error: "Não autorizado" };
        }

        const parsedData = editStudentSchema.parse(data);

        await updateStudent(id, {
            name: parsedData.name,
            email: parsedData.email,
            cpf: parsedData.cpf,
            studentPhone: parsedData.studentPhone,
            parentPhone: parsedData.parentPhone || null,
            birthDate: parsedData.birthDate,
            genre: parsedData.genre,
            school: parsedData.school,
        });

        updateTag("students-list");
        updateTag(`student-${id}`);

    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2002") {
                const target = JSON.stringify(error.meta?.target || "").toLowerCase();
                const message = error.message.toLowerCase();

                if (target.includes("email") || message.includes("email")) {
                    return { success: false, error: "Este e-mail já está em uso por outro aluno." };
                }
                if (target.includes("cpf") || message.includes("cpf")) {
                    return { success: false, error: "Este CPF já está em uso por outro aluno." };
                }
                if (target.includes("luna_id") || target.includes("lunaid") || message.includes("luna_id")) {
                    return { success: false, error: "Esta Matrícula já está em uso por outro aluno." };
                }

                return { success: false, error: "Conflito de dados: Outro aluno já possui estas informações." };
            }
        }
        if (isRedirectError(error)) throw error;
        
        console.error("Erro ao editar aluno:", error);
        return { success: false, error: "Ocorreu um erro inesperado ao atualizar o aluno." };
    }

    redirect("/admin/alunos");
}

export async function deleteStudentAction(studentId: string, adminPasswordConfirm: string) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        const actorId = session?.user?.id;

        if (!actorId) {
            return { success: false, error: "Não autorizado" };
        }

        // Verify password
        const adminAccount = await prisma.account.findFirst({
            where: { userId: actorId, providerId: "credential" },
        });

        if (!adminAccount?.password) {
            return { success: false, error: "Não foi possível verificar a senha do administrador." };
        }

        const { verifyPassword } = await import("better-auth/crypto");
        const isPasswordValid = await verifyPassword({
            hash: adminAccount.password,
            password: adminPasswordConfirm,
        });

        if (!isPasswordValid) {
            return { success: false, error: "Senha incorreta." };
        }

        const { deleteStudent } = await import("@/services/students/students.service");
        await deleteStudent(studentId);

        updateTag("students-list");
        updateTag("students-count");
        updateTag(`student-${studentId}`);

        return { success: true };
    } catch (error) {
        if (isRedirectError(error)) throw error;
        console.error("Erro fatal ao excluir aluno:", error);
        return { success: false, error: "Erro fatal ao excluir aluno." };
    }
}

export type ImportResult = {
    success: true;
    created: number;
    updated: number;
    total: number;
    skipped: { row: number; errors: string[] }[];
    dbErrors: { row: number; cpf: string; error: string }[];
} | {
    success: false;
    error: string;
};

export async function importStudentsAction(formData: FormData): Promise<ImportResult> {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user?.id) {
            return { success: false, error: "Não autorizado" };
        }

        const file = formData.get("file") as File | null;
        if (!file) {
            return { success: false, error: "Nenhum arquivo enviado." };
        }

        if (!file.name.endsWith(".csv")) {
            return { success: false, error: "Formato inválido. Envie um arquivo .csv." };
        }

        const content = await file.text();
        const { parseCsv, parseDateString, parseGenre } = await import("@/lib/csv-helper");
        const rows = parseCsv(content);

        if (rows.length === 0) {
            return { success: false, error: "O arquivo CSV está vazio ou não possui dados válidos." };
        }

        if (rows.length > 1000) {
            return { success: false, error: "O arquivo excede o limite de 1000 alunos por importação." };
        }

        // Validar e transformar cada linha
        type BulkStudentInput = {
            name: string;
            email: string;
            cpf: string;
            birthDate: Date;
            genre: Genre;
            studentPhone: string;
            parentPhone?: string | null;
            school: string;
        };
        const validStudents: BulkStudentInput[] = [];
        const skipped: { row: number; errors: string[] }[] = [];

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const rowNumber = i + 2; // +2 pois linha 1 é o cabeçalho e o array é 0-indexed

            // Limpar CPF e telefones (remover formatação)
            const cleanCpf = (row.cpf || "").replace(/\D/g, "");
            const cleanPhone = (row.celular_aluno || "").replace(/\D/g, "");
            const cleanParentPhone = (row.celular_responsavel || "").replace(/\D/g, "");

            const parsed = importStudentRowSchema.safeParse({
                nome: row.nome || row.name || "",
                email: row.email || row.e_mail || "",
                cpf: cleanCpf,
                data_nascimento: row.data_nascimento || row.data_de_nascimento || row.nascimento || "",
                genero: row.genero || row.sexo || "",
                celular_aluno: cleanPhone,
                celular_responsavel: cleanParentPhone,
                escola_origem: row.escola_origem || row.escola || "",
            });

            if (!parsed.success) {
                skipped.push({
                    row: rowNumber,
                    errors: parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`),
                });
                continue;
            }

            const birthDate = parseDateString(parsed.data.data_nascimento);
            if (!birthDate) {
                skipped.push({
                    row: rowNumber,
                    errors: [`Data de nascimento inválida: "${parsed.data.data_nascimento}". Use DD/MM/YYYY ou YYYY-MM-DD.`],
                });
                continue;
            }

            validStudents.push({
                name: parsed.data.nome,
                email: parsed.data.email,
                cpf: parsed.data.cpf,
                birthDate,
                genre: parseGenre(parsed.data.genero),
                studentPhone: parsed.data.celular_aluno,
                parentPhone: parsed.data.celular_responsavel || null,
                school: parsed.data.escola_origem,
            });
        }

        if (validStudents.length === 0) {
            return { success: false, error: "Nenhuma linha válida encontrada no CSV." };
        }

        const periodId = formData.get("periodId") as string | null;

        // Executar o bulk upsert
        const { bulkUpsertStudents } = await import("@/services/students/students.service");
        const result = await bulkUpsertStudents(validStudents, periodId || undefined);

        updateTag("students-list");
        updateTag("students-count");
        if (periodId) {
            updateTag(`period:${periodId}:students-list`);
            updateTag(`period:${periodId}:students-count`);
        }

        return {
            success: true,
            created: result.created,
            updated: result.updated,
            total: result.total,
            skipped,
            dbErrors: result.errors,
        };
    } catch (error) {
        if (isRedirectError(error)) throw error;
        console.error("Erro na importação em massa:", error);
        return { success: false, error: "Erro inesperado durante a importação." };
    }
}

export async function unlinkStudentsFromPeriodAction(studentIds: string[], periodId: string, adminPasswordConfirm: string) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        const actorId = session?.user?.id;

        if (!actorId) {
            return { success: false, error: "Não autorizado" };
        }

        if (studentIds.length === 0) {
            return { success: false, error: "Nenhum aluno selecionado" };
        }

        // Verificar senha
        const adminAccount = await prisma.account.findFirst({
            where: { userId: actorId, providerId: "credential" },
        });

        if (!adminAccount?.password) {
            return { success: false, error: "Não foi possível verificar a senha do administrador." };
        }

        const { verifyPassword } = await import("better-auth/crypto");
        const isPasswordValid = await verifyPassword({
            hash: adminAccount.password,
            password: adminPasswordConfirm,
        });

        if (!isPasswordValid) {
            return { success: false, error: "Senha incorreta." };
        }

        const { unlinkStudentsFromPeriod } = await import("@/services/students/students.service");
        await unlinkStudentsFromPeriod(studentIds, periodId);

        updateTag(`period:${periodId}:students-list`);
        updateTag(`period:${periodId}:students-count`);

        return { success: true };
    } catch (error) {
        console.error("Erro ao desvincular alunos:", error);
        return { success: false, error: "Erro inesperado ao desvincular alunos." };
    }
}
