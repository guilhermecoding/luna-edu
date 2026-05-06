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
 * Retorna a quantidade total de alunos em um período.
 */
export async function getTotalStudentsCountByPeriodId(periodId: string): Promise<number> {
    "use cache";
    cacheLife("days");
    cacheTag(`period:${periodId}:students-count`);

    return await prisma.studentPeriod.count({
        where: {
            periodId: periodId,
        },
    });
}

/**
 * Retorna a lista de alunos de um período específico no mesmo formato da lista principal.
 */
export async function getStudentsByPeriodList(periodId: string, query?: string) {
    "use cache";
    cacheLife("minutes");
    cacheTag(`period:${periodId}:students-list`);

    const studentsPeriods = await prisma.studentPeriod.findMany({
        where: {
            periodId: periodId,
            student: query ? {
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
            } : undefined,
        },
        include: {
            student: {
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
            },
        },
        orderBy: {
            student: {
                name: "asc",
            },
        },
    });

    return studentsPeriods.map(sp => sp.student);
}
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
export async function createStudent(
    data: Omit<Parameters<typeof prisma.student.create>[0]["data"], "id" | "createdAt" | "lunaId" | "studentPeriods">,
    periodId?: string,
) {
    const { generateLunaId } = await import("@/lib/generate-luna-id");
    const lunaId = await generateLunaId();
    
    return await prisma.student.create({
        data: {
            ...data,
            lunaId,
            studentPeriods: periodId ? {
                create: {
                    periodId,
                    status: "WAITING",
                },
            } : undefined,
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
 * Processa cada aluno individualmente para isolar erros por linha.
 * Retorna um resumo da operação.
 */
export async function bulkUpsertStudents(students: BulkStudentInput[], periodId?: string) {
    let created = 0;
    let updated = 0;
    const errors: { row: number; cpf: string; error: string }[] = [];

    // Gerar um pool de LunaIDs para todos os alunos novos de uma vez
    // consultando o banco uma única vez para evitar duplicatas
    const year = new Date().getFullYear().toString();
    const [lastUser, lastStudent] = await Promise.all([
        prisma.user.findFirst({
            where: { lunaId: { startsWith: year } },
            orderBy: { lunaId: "desc" },
            select: { lunaId: true },
        }),
        prisma.student.findFirst({
            where: { lunaId: { startsWith: year } },
            orderBy: { lunaId: "desc" },
            select: { lunaId: true },
        }),
    ]);

    const getSeq = (id: string | null | undefined) => {
        if (!id) return 0;
        return parseInt(id.slice(year.length)) || 0;
    };

    let lunaIdSequence = Math.max(getSeq(lastUser?.lunaId), getSeq(lastStudent?.lunaId));

    const nextLunaId = () => {
        lunaIdSequence++;
        return `${year}${lunaIdSequence.toString().padStart(5, "0")}`;
    };

    // Processar em lotes
    for (let i = 0; i < students.length; i += BATCH_SIZE) {
        const batch = students.slice(i, i + BATCH_SIZE);
        const batchCpfs = batch.map((s) => s.cpf);

        // Buscar CPFs que já existem neste lote
        const existingStudents = await prisma.student.findMany({
            where: { cpf: { in: batchCpfs } },
            select: { id: true, cpf: true },
        });
        const existingMap = new Map(existingStudents.map((s) => [s.cpf, s]));

        // Processar cada aluno individualmente para isolar erros
        for (const student of batch) {
            const rowIdx = students.indexOf(student) + 1;
            const existing = existingMap.get(student.cpf);

            try {
                let studentRecordId: string;
                
                if (existing) {
                    // UPDATE: Atualizar dados que podem mudar (como e-mail para acesso ao resultado)
                    const updatedStudent = await prisma.student.update({
                        where: { id: existing.id },
                        data: {
                            name: student.name,
                            email: student.email,
                            studentPhone: student.studentPhone,
                            parentPhone: student.parentPhone || null,
                            birthDate: student.birthDate,
                            genre: student.genre,
                            school: student.school,
                            // CPF e LunaID NUNCA mudam na importação
                        },
                    });
                    updated++;
                    studentRecordId = updatedStudent.id;
                } else {
                    // CREATE: atribuir próximo LunaID disponível
                    const newStudent = await prisma.student.create({
                        data: {
                            name: student.name,
                            email: student.email,
                            cpf: student.cpf,
                            studentPhone: student.studentPhone,
                            parentPhone: student.parentPhone || null,
                            birthDate: student.birthDate,
                            genre: student.genre,
                            school: student.school,
                            lunaId: nextLunaId(),
                        },
                    });
                    created++;
                    studentRecordId = newStudent.id;
                }

                // VÍNCULO DE PERÍODO (Em Espera)
                if (periodId) {
                    await prisma.studentPeriod.upsert({
                        where: {
                            studentId_periodId: {
                                studentId: studentRecordId,
                                periodId: periodId,
                            },
                        },
                        create: {
                            studentId: studentRecordId,
                            periodId: periodId,
                            status: "WAITING",
                        },
                        update: {}, // Não altera status se já existir
                    });
                }

            } catch (error) {
                // Traduzir erros P2002 para mensagens legíveis
                let message = error instanceof Error ? error.message : "Erro desconhecido";
                if (
                    error !== null &&
                    typeof error === "object" &&
                    "code" in error &&
                    (error as { code: string }).code === "P2002"
                ) {
                    message = "Conflito de dados: O e-mail informado já pertence a outro CPF.";
                }
                errors.push({ row: rowIdx, cpf: student.cpf, error: message });
            }
        }
    }

    return { created, updated, errors, total: students.length };
}
/**
 * Desvincula uma lista de alunos de um período, removendo todos os seus dados relacionados a esse período.
 */
export async function unlinkStudentsFromPeriod(studentIds: string[], periodId: string) {
    return await prisma.$transaction(async (tx) => {
        // 1. Remover Presenças em aulas de cursos deste período
        await tx.attendance.deleteMany({
            where: {
                studentId: { in: studentIds },
                lesson: {
                    course: {
                        periodId: periodId,
                    },
                },
            },
        });

        // 2. Remover Notas de Atividades de cursos deste período
        await tx.activityGrade.deleteMany({
            where: {
                studentId: { in: studentIds },
                activity: {
                    course: {
                        periodId: periodId,
                    },
                },
            },
        });

        // 3. Remover Notas Finais e Estatísticas de cursos deste período
        await tx.finalGrade.deleteMany({
            where: {
                studentId: { in: studentIds },
                course: {
                    periodId: periodId,
                },
            },
        });
        await tx.studentCourseStats.deleteMany({
            where: {
                studentId: { in: studentIds },
                course: {
                    periodId: periodId,
                },
            },
        });

        // 4. Remover Matrículas em cursos deste período
        await tx.enrollment.deleteMany({
            where: {
                studentId: { in: studentIds },
                course: {
                    periodId: periodId,
                },
            },
        });

        // 5. Finalmente, remover o vínculo de Período (Em Espera / Matriculado)
        return await tx.studentPeriod.deleteMany({
            where: {
                studentId: { in: studentIds },
                periodId: periodId,
            },
        });
    });
}
