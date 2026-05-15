import { Prisma } from "@/generated/prisma/client";
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
 * Retorna a lista de alunos de uma turma física específica no mesmo formato da lista principal.
 */
export async function getStudentsByClassGroupList(classGroupId: string, query?: string) {
    "use cache";
    cacheLife("minutes");
    cacheTag(`class-group:${classGroupId}:students-list`);

    return await prisma.student.findMany({
        where: {
            enrollments: {
                some: {
                    course: {
                        classGroupId: classGroupId,
                    },
                },
            },
            ...(query ? {
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
            } : {}),
        },
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
 * Retorna a lista de alunos de um período que estão disponíveis para serem enturmados em uma turma específica.
 * Um aluno está disponível se ele pertence ao período e ainda não está matriculado nesta turma específica.
 */
export async function getAvailableStudentsForClassGroup(
    periodId: string,
    classGroupId: string,
    query?: string,
    page: number = 1,
    limit: number = 20,
) {
    "use cache";
    cacheLife("minutes");
    cacheTag(`period:${periodId}:available-students`);

    const skip = (page - 1) * limit;

    const where = {
        studentPeriods: {
            some: {
                periodId,
            },
        },
        // Não mostrar alunos que já estão nesta turma específica
        NOT: {
            enrollments: {
                some: {
                    course: {
                        classGroupId: classGroupId,
                    },
                },
            },
        },
        ...(query ? {
            OR: [
                { name: { contains: query, mode: "insensitive" as const } },
                ...(query.replace(/\D/g, "") ? [
                    { cpf: { contains: query.replace(/\D/g, "") } },
                    { lunaId: { contains: query.replace(/\D/g, "") } },
                ] : []),
            ],
        } : {}),
    };

    const [students, total] = await Promise.all([
        prisma.student.findMany({
            where,
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
                name: "asc" as const,
            },
            skip,
            take: limit,
        }),
        prisma.student.count({ where }),
    ]);

    return { students, total };
}

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
 * Retorna a lista de alunos de um período específico no mesmo formato da lista principal,
 * com turmas físicas (class groups) em que o aluno possui matrícula naquele período.
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
                    enrollments: {
                        where: {
                            course: {
                                periodId,
                                classGroupId: { not: null },
                            },
                        },
                        select: {
                            course: {
                                select: {
                                    classGroup: {
                                        select: {
                                            id: true,
                                            name: true,
                                            slug: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        orderBy: {
            student: {
                name: "asc",
            },
        },
    });

    return studentsPeriods.map((sp) => {
        const { enrollments, ...student } = sp.student;
        const byId = new Map<string, { id: string; name: string; slug: string }>();
        for (const e of enrollments) {
            const cg = e.course.classGroup;
            if (cg) {
                byId.set(cg.id, cg);
            }
        }
        const classGroups = [...byId.values()].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
        return { ...student, classGroups };
    });
}

export type StudentPeriodListItem = Awaited<ReturnType<typeof getStudentsByPeriodList>>[number];
/**
 * Retorna um aluno pelo ID
 */
export async function getStudentById(id: string) {
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
const DB_CONCURRENCY = 20;

/**
 * Importa alunos em massa usando Upsert (cria ou atualiza).
 * Processa cada aluno individualmente para isolar erros por linha.
 * Retorna um resumo da operação.
 */
export async function bulkUpsertStudents(students: BulkStudentInput[], periodId?: string) {
    let created = 0;
    let updated = 0;
    const errors: { row: number; cpf: string; error: string }[] = [];
    const studentsToLinkInPeriod: string[] = [];

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

    const normalizeDbError = (error: unknown) => {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
            const target = (error.meta?.target as string[]) || [];
            if (target.includes("cpf")) {
                return "Conflito: Já existe um aluno cadastrado com este CPF.";
            }
            if (target.includes("luna_id") || target.includes("lunaId")) {
                return "Conflito: Esta Matrícula (LUNA ID) já está em uso.";
            }
            if (target.includes("email")) {
                return "Conflito: Este e-mail já está em uso por outro aluno.";
            }
            return "Conflito de dados: Um registro com estas informações já existe.";
        }
        return error instanceof Error ? error.message : "Erro desconhecido";
    };

    const studentsWithRow = students.map((student, index) => ({
        row: index + 1,
        student,
    }));

    const allExistingStudents = await prisma.student.findMany({
        where: { cpf: { in: students.map((student) => student.cpf) } },
        select: { id: true, cpf: true },
    });
    const existingMap = new Map(allExistingStudents.map((student) => [student.cpf, student.id]));

    const toUpdate = studentsWithRow.filter(({ student }) => existingMap.has(student.cpf));
    const toCreate = studentsWithRow.filter(({ student }) => !existingMap.has(student.cpf));

    // UPDATE: processa em paralelo controlado para reduzir tempo total da action
    for (let i = 0; i < toUpdate.length; i += DB_CONCURRENCY) {
        const updateChunk = toUpdate.slice(i, i + DB_CONCURRENCY);
        const updateResults = await Promise.allSettled(
            updateChunk.map(async ({ row, student }) => {
                const studentId = existingMap.get(student.cpf);
                if (!studentId) return;

                const updatedStudent = await prisma.student.update({
                    where: { id: studentId },
                    data: {
                        name: student.name,
                        email: student.email,
                        studentPhone: student.studentPhone,
                        parentPhone: student.parentPhone || null,
                        birthDate: student.birthDate,
                        genre: student.genre,
                        school: student.school,
                    },
                    select: { id: true },
                });

                studentsToLinkInPeriod.push(updatedStudent.id);
                updated++;
            }),
        );

        for (let j = 0; j < updateResults.length; j++) {
            const result = updateResults[j];
            if (result.status === "rejected") {
                const failed = updateChunk[j];
                errors.push({
                    row: failed.row,
                    cpf: failed.student.cpf,
                    error: normalizeDbError(result.reason),
                });
            }
        }
    }

    // CREATE: processa em lotes com concorrência controlada
    for (let i = 0; i < toCreate.length; i += BATCH_SIZE) {
        const createBatch = toCreate.slice(i, i + BATCH_SIZE).map(({ row, student }) => ({
            row,
            student: {
                ...student,
                lunaId: nextLunaId(),
            },
        }));

        for (let j = 0; j < createBatch.length; j += DB_CONCURRENCY) {
            const createChunk = createBatch.slice(j, j + DB_CONCURRENCY);
            const createResults = await Promise.allSettled(
                createChunk.map(async ({ student }) => {
                    const createdStudent = await prisma.student.create({
                        data: {
                            name: student.name,
                            email: student.email,
                            cpf: student.cpf,
                            studentPhone: student.studentPhone,
                            parentPhone: student.parentPhone || null,
                            birthDate: student.birthDate,
                            genre: student.genre,
                            school: student.school,
                            lunaId: student.lunaId,
                        },
                        select: { id: true },
                    });

                    studentsToLinkInPeriod.push(createdStudent.id);
                    created++;
                }),
            );

            for (let k = 0; k < createResults.length; k++) {
                const result = createResults[k];
                if (result.status === "rejected") {
                    const failed = createChunk[k];
                    errors.push({
                        row: failed.row,
                        cpf: failed.student.cpf,
                        error: normalizeDbError(result.reason),
                    });
                }
            }
        }
    }

    if (periodId && studentsToLinkInPeriod.length > 0) {
        await prisma.studentPeriod.createMany({
            data: studentsToLinkInPeriod.map((studentId) => ({
                studentId,
                periodId,
                status: "WAITING",
            })),
            skipDuplicates: true,
        });
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

/**
 * Retorna a lista de alunos matriculados em um período com seu status de acesso ao SAD.
 * Filtra apenas alunos que possuem ao menos um vínculo com turma.
 */
export async function getSADAccessList(periodId: string, filter?: "VIEWED" | "NOT_VIEWED") {
    "use cache";
    cacheLife("minutes");
    cacheTag(`period:${periodId}:sad-access`);

    return await prisma.studentPeriod.findMany({
        where: {
            periodId: periodId,
            // Apenas alunos matriculados (vínculo com turma)
            student: {
                enrollments: {
                    some: {
                        course: {
                            periodId: periodId,
                            classGroupId: { not: null },
                        },
                    },
                },
            },
            // Filtro de visualização
            ...(filter === "VIEWED" ? { accessedAt: { not: null } } : {}),
            ...(filter === "NOT_VIEWED" ? { accessedAt: null } : {}),
        },
        select: {
            accessedAt: true,
            student: {
                select: {
                    id: true,
                    name: true,
                    cpf: true,
                    email: true,
                    genre: true,
                    birthDate: true,
                },
            },
        },
        orderBy: {
            student: {
                name: "asc",
            },
        },
    });
}
