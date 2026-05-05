import prisma from "@/lib/prisma";
import { cacheLife, cacheTag } from "next/cache";

/**
 * Retorna a quantidade de alunos únicos matriculados nas disciplinas de uma turma física (ClassGroup).
 */
export async function getStudentCountByClassGroupId(classGroupId: string): Promise<number> {
    "use cache";
    cacheLife("weeks");
    cacheTag(`class-group:${classGroupId}:students-count`);

    return await prisma.student.count({
        where: {
            enrollments: {
                some: {
                    course: {
                        classGroupId: classGroupId,
                    },
                },
            },
        },
    });
}

/**
 * Retorna a quantidade total de alunos no sistema.
 */
export async function getTotalStudentsCount(): Promise<number> {
    "use cache";
    cacheLife("days");
    cacheTag("students-count");

    return await prisma.student.count();
}

/**
 * Retorna a lista de alunos do sistema, com opção de filtro pelo nome ou CPF.
 */
export async function getStudentsList(query?: string) {
    "use cache";
    cacheLife("minutes");
    cacheTag("students-list");

    return await prisma.student.findMany({
        where: query ? {
            OR: [
                {
                    name: {
                        contains: query,
                        mode: "insensitive" as const,
                    },
                },
                ...(query.replace(/\D/g, "") ? [
                    {
                        cpf: {
                            contains: query.replace(/\D/g, ""),
                        },
                    },
                    {
                        lunaId: {
                            contains: query.replace(/\D/g, ""),
                        },
                    },
                ] : []),
            ],
        } : {},
        select: {
            id: true,
            lunaId: true,
            name: true,
            email: true,
            cpf: true,
            studentPhone: true,
            birthDate: true,
            genre: true,
            school: true,
        },
        orderBy: {
            name: "asc",
        },
    });
}

export type StudentListItem = Awaited<ReturnType<typeof getStudentsList>>[number];

/**
 * Retorna um aluno pelo ID
 */
export async function getStudentById(id: string) {
    "use cache";
    cacheLife("minutes");
    cacheTag(`student-${id}`);

    return await prisma.student.findUnique({
        where: { id },
    });
}

/**
 * Cria um novo aluno com LUNA ID gerado automaticamente.
 */
export async function createStudent(data: Omit<Parameters<typeof prisma.student.create>[0]["data"], "id" | "createdAt" | "lunaId">) {
    const { generateLunaId } = await import("@/lib/generate-luna-id");
    const lunaId = await generateLunaId();
    
    return await prisma.student.create({
        data: {
            ...data,
            lunaId,
        },
    });
}

/**
 * Atualiza um aluno existente
 */
export async function updateStudent(id: string, data: Partial<Parameters<typeof prisma.student.update>[0]["data"]>) {
    return await prisma.student.update({
        where: { id },
        data,
    });
}

/**
 * Remove um aluno do sistema permanentemente, limpando todos os seus vínculos.
 */
export async function deleteStudent(id: string) {
    return await prisma.$transaction(async (tx) => {
        // Limpar vínculos
        await tx.enrollment.deleteMany({ where: { studentId: id } });
        await tx.attendance.deleteMany({ where: { studentId: id } });
        await tx.activityGrade.deleteMany({ where: { studentId: id } });
        await tx.finalGrade.deleteMany({ where: { studentId: id } });
        await tx.studentCourseStats.deleteMany({ where: { studentId: id } });
        await tx.notification.deleteMany({ where: { studentId: id } });

        // Apagar o aluno
        return await tx.student.delete({
            where: { id },
        });
    });
}

// ================= IMPORTAÇÃO EM MASSA =================

export type BulkStudentInput = {
    name: string;
    email: string;
    cpf: string;
    birthDate: Date;
    genre: "MALE" | "FEMALE" | "NON_BINARY" | "PREFER_NOT_TO_SAY";
    studentPhone: string;
    parentPhone?: string | null;
    school: string;
};

const BATCH_SIZE = 100;

/**
 * Importa alunos em massa usando Upsert (cria ou atualiza).
 * Processa em lotes de 100 para evitar timeout e sobrecarga no banco.
 * Retorna um resumo da operação.
 */
export async function bulkUpsertStudents(students: BulkStudentInput[]) {
    const { generateLunaId } = await import("@/lib/generate-luna-id");

    let created = 0;
    let updated = 0;
    const errors: { row: number; cpf: string; error: string }[] = [];

    // Processar em lotes
    for (let i = 0; i < students.length; i += BATCH_SIZE) {
        const batch = students.slice(i, i + BATCH_SIZE);
        const batchCpfs = batch.map((s) => s.cpf);

        // Buscar CPFs que já existem neste lote
        const existingStudents = await prisma.student.findMany({
            where: { cpf: { in: batchCpfs } },
            select: { id: true, cpf: true, lunaId: true },
        });
        const existingMap = new Map(existingStudents.map((s) => [s.cpf, s]));

        // Gerar LunaIDs para os novos alunos deste lote
        const newStudents = batch.filter((s) => !existingMap.has(s.cpf));
        const newLunaIds: string[] = [];
        for (let j = 0; j < newStudents.length; j++) {
            newLunaIds.push(await generateLunaId());
        }

        // Executar upserts em transação
        try {
            await prisma.$transaction(
                batch.map((student, idx) => {
                    const existing = existingMap.get(student.cpf);

                    if (existing) {
                        // UPDATE: preservar LunaID existente
                        return prisma.student.update({
                            where: { id: existing.id },
                            data: {
                                name: student.name,
                                email: student.email,
                                studentPhone: student.studentPhone,
                                parentPhone: student.parentPhone || null,
                                birthDate: student.birthDate,
                                genre: student.genre,
                                school: student.school,
                            },
                        });
                    } else {
                        // CREATE: gerar novo LunaID
                        const newIdx = newStudents.indexOf(student);
                        return prisma.student.create({
                            data: {
                                name: student.name,
                                email: student.email,
                                cpf: student.cpf,
                                studentPhone: student.studentPhone,
                                parentPhone: student.parentPhone || null,
                                birthDate: student.birthDate,
                                genre: student.genre,
                                school: student.school,
                                lunaId: newLunaIds[newIdx],
                            },
                        });
                    }
                }),
            );

            // Contar resultados
            for (const student of batch) {
                if (existingMap.has(student.cpf)) {
                    updated++;
                } else {
                    created++;
                }
            }
        } catch (error) {
            // Se o lote inteiro falhar, registrar os erros individuais
            for (const student of batch) {
                const rowIdx = students.indexOf(student) + 1;
                errors.push({
                    row: rowIdx,
                    cpf: student.cpf,
                    error: error instanceof Error ? error.message : "Erro desconhecido",
                });
            }
        }
    }

    return { created, updated, errors, total: students.length };
}
