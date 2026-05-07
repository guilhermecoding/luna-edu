import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// ─── Validações ────────────────────────────────────────────

function isValidCPF(cpf: string): boolean {
    // Simplificado para permitir dados de teste; verifica apenas se possui 11 dígitos
    return /^\d{11}$/.test(cpf);
}

function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidUUID(uuid: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid);
}

// ─── Tipagem do Response ────────────────────────────────────

interface ScheduleItem {
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    teacherName: string | null;
    room: {
        name: string | null;
        block: string | null;
    } | null;
}

interface CourseItem {
    code: string;
    name: string;
    subjectName: string;
    shift: string;
    room: {
        name: string | null;
        block: string | null;
        campus: {
            name: string;
            address: string;
        };
    } | null;
    schedules: ScheduleItem[];
}

interface ClassGroupItem {
    name: string;
    shift: string;
    courses: CourseItem[];
}

interface EnrolledResponse {
    success: true;
    status: "ENROLLED";
    student: {
        name: string;
        phone: string;
        school: string;
    };
    period: {
        name: string;
        startDate: string;
        endDate: string;
        program: {
            name: string;
        };
    };
    classGroups: ClassGroupItem[];
}

interface WaitingResponse {
    success: true;
    status: "WAITING";
    student: {
        name: string;
        phone: string;
        school: string;
    };
    period: {
        name: string;
        startDate: string;
        endDate: string;
        program: {
            name: string;
        };
    };
}

interface ErrorResponse {
    success: false;
    error: string;
    code: string;
}

type ApiResponse = EnrolledResponse | WaitingResponse | ErrorResponse;

// ─── Handler ────────────────────────────────────────────────

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
    try {
        // 1. Obter chave canônica do Header (Authorization)
        const canonicalCode = request.headers.get("authorization")?.replace("Bearer ", "");

        // 2. Parse do body
        let body: Record<string, unknown>;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { success: false, error: "O corpo da requisição deve ser um JSON válido.", code: "INVALID_BODY" },
                { status: 400 },
            );
        }

        const { cpf, email, periodCode } = body as {
            cpf?: string;
            email?: string;
            periodCode?: string;
        };

        // 3. Validação dos campos obrigatórios
        if (!cpf || !email || !periodCode) {
            return NextResponse.json(
                { success: false, error: "Os campos cpf, email e periodCode são obrigatórios no corpo da requisição.", code: "MISSING_FIELDS" },
                { status: 400 },
            );
        }

        if (!canonicalCode) {
            return NextResponse.json(
                { success: false, error: "O código canônico é obrigatório no header Authorization.", code: "MISSING_AUTH" },
                { status: 401 },
            );
        }

        // 3. Validação de formato
        if (typeof cpf !== "string" || !isValidCPF(cpf)) {
            return NextResponse.json(
                { success: false, error: "CPF inválido. Envie 11 dígitos numéricos válidos sem pontuação.", code: "INVALID_CPF" },
                { status: 422 },
            );
        }

        if (typeof email !== "string" || !isValidEmail(email)) {
            return NextResponse.json(
                { success: false, error: "Email em formato inválido.", code: "INVALID_EMAIL" },
                { status: 422 },
            );
        }

        if (typeof canonicalCode !== "string" || !isValidUUID(canonicalCode)) {
            return NextResponse.json(
                { success: false, error: "Código canônico em formato inválido. Deve ser um UUID.", code: "INVALID_CANONICAL_CODE" },
                { status: 422 },
            );
        }

        if (typeof periodCode !== "string" || periodCode.trim().length === 0) {
            return NextResponse.json(
                { success: false, error: "Código do período é obrigatório.", code: "INVALID_PERIOD_CODE" },
                { status: 422 },
            );
        }

        // 4. Buscar período pelo slug (código)
        const period = await prisma.period.findFirst({
            where: { slug: periodCode.trim() },
            select: {
                id: true,
                name: true,
                startDate: true,
                endDate: true,
                canonicalCode: true,
                program: {
                    select: { name: true },
                },
            },
        });

        if (!period) {
            return NextResponse.json(
                { success: false, error: "Período não encontrado com o código informado.", code: "PERIOD_NOT_FOUND" },
                { status: 404 },
            );
        }

        // 5. Validar chave canônica
        if (period.canonicalCode !== canonicalCode) {
            return NextResponse.json(
                { success: false, error: "Código canônico não corresponde ao período informado.", code: "CANONICAL_MISMATCH" },
                { status: 403 },
            );
        }

        // 6. Buscar aluno por CPF + Email
        const student = await prisma.student.findFirst({
            where: {
                cpf: cpf,
                email: email.toLowerCase().trim(),
            },
            select: {
                id: true,
                name: true,
                studentPhone: true,
                school: true,
            },
        });

        if (!student) {
            return NextResponse.json(
                { success: false, error: "Aluno não encontrado com o CPF e email informados.", code: "STUDENT_NOT_FOUND" },
                { status: 404 },
            );
        }

        // 7. Verificar vínculo com o período
        const studentPeriod = await prisma.studentPeriod.findUnique({
            where: {
                studentId_periodId: {
                    studentId: student.id,
                    periodId: period.id,
                },
            },
            select: { status: true },
        });

        if (!studentPeriod) {
            return NextResponse.json(
                { success: false, error: "Aluno não está vinculado a este período.", code: "NOT_IN_PERIOD" },
                { status: 404 },
            );
        }

        // 8. Verificar se o aluno possui ao menos uma matrícula em turma deste período
        const enrollmentCount = await prisma.enrollment.count({
            where: {
                studentId: student.id,
                course: {
                    periodId: period.id,
                    classGroupId: { not: null },
                },
            },
        });

        const isEnrolled = enrollmentCount > 0;

        if (!isEnrolled) {
            return NextResponse.json(
                {
                    success: true,
                    status: "WAITING",
                    student: {
                        name: student.name,
                        phone: student.studentPhone,
                        school: student.school,
                    },
                    period: {
                        name: period.name,
                        startDate: period.startDate.toISOString().split("T")[0],
                        endDate: period.endDate.toISOString().split("T")[0],
                        program: {
                            name: period.program.name,
                        },
                    },
                } as WaitingResponse,
                { status: 200 },
            );
        }

        // 9. Buscar dados completos do aluno matriculado (query otimizada: single query)
        const classGroups = await prisma.classGroup.findMany({
            where: {
                periodId: period.id,
                courses: {
                    some: {
                        enrollments: {
                            some: { studentId: student.id },
                        },
                    },
                },
            },
            select: {
                name: true,
                shift: true,
                courses: {
                    where: {
                        enrollments: {
                            some: { studentId: student.id },
                        },
                    },
                    select: {
                        code: true,
                        name: true,
                        shift: true,
                        subject: {
                            select: { name: true },
                        },
                        room: {
                            select: {
                                name: true,
                                block: true,
                                campus: {
                                    select: {
                                        name: true,
                                        address: true,
                                    },
                                },
                            },
                        },
                        schedules: {
                            select: {
                                dayOfWeek: true,
                                timeSlot: {
                                    select: {
                                        startTime: true,
                                        endTime: true,
                                    },
                                },
                                teacher: {
                                    select: { name: true },
                                },
                                room: {
                                    select: {
                                        name: true,
                                        block: true,
                                    },
                                },
                            },
                            orderBy: [
                                { dayOfWeek: "asc" },
                                { timeSlot: { startTime: "asc" } },
                            ],
                        },
                    },
                    orderBy: { name: "asc" },
                },
            },
            orderBy: { name: "asc" },
        });

        // 10. Montar resposta
        const response: EnrolledResponse = {
            success: true,
            status: "ENROLLED",
            student: {
                name: student.name,
                phone: student.studentPhone,
                school: student.school,
            },
            period: {
                name: period.name,
                startDate: period.startDate.toISOString().split("T")[0],
                endDate: period.endDate.toISOString().split("T")[0],
                program: {
                    name: period.program.name,
                },
            },
            classGroups: classGroups.map((cg) => ({
                name: cg.name,
                shift: cg.shift,
                courses: cg.courses.map((course) => ({
                    code: course.code,
                    name: course.name,
                    subjectName: course.subject.name,
                    shift: course.shift,
                    room: course.room
                        ? {
                            name: course.room.name,
                            block: course.room.block,
                            campus: {
                                name: course.room.campus.name,
                                address: course.room.campus.address,
                            },
                        }
                        : null,
                    schedules: course.schedules.map((s) => ({
                        dayOfWeek: s.dayOfWeek,
                        startTime: s.timeSlot.startTime,
                        endTime: s.timeSlot.endTime,
                        teacherName: s.teacher?.name ?? null,
                        room: s.room
                            ? { name: s.room.name, block: s.room.block }
                            : null,
                    })),
                })),
            })),
        };

        return NextResponse.json(response, { status: 200 });
    } catch (error) {
        console.error("[API /api/sad] Erro interno:", error);
        return NextResponse.json(
            { success: false, error: "Erro interno do servidor.", code: "INTERNAL_ERROR" },
            { status: 500 },
        );
    }
}
