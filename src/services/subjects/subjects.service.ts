import { Subject } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";
import { cacheLife, cacheTag } from "next/cache";

/**
 * Lista todas as disciplinas teóricas (Subjects) vinculadas a uma Matriz (Degree).
 *
 * @param degreeId ID da Matriz/Curso pai.
 * @returns Lista de disciplinas bases.
 */
export async function getSubjectsByDegreeId(degreeId: string): Promise<Subject[]> {
    "use cache";
    cacheLife("max");
    cacheTag(`degree:${degreeId}:subjects`);

    return await prisma.subject.findMany({
        where: {
            degreeId,
        },
        orderBy: [
            { basePeriod: "asc" },
            { name: "asc" },
        ],
    });
}

/**
 * Lista todas as disciplinas vinculadas a todas as matrizes de um programa.
 * Utilizado no formulário de criação de turmas para filtrar por programa.
 *
 * @param programSlug Slug do programa.
 * @returns Lista de disciplinas com informações da matriz (degree).
 */
export async function getSubjectsByProgramSlug(programSlug: string) {
    "use cache";
    cacheLife("max");
    cacheTag(`program:${programSlug}:subjects`);

    return await prisma.subject.findMany({
        where: {
            degree: {
                program: {
                    slug: programSlug,
                },
            },
        },
        include: {
            degree: {
                select: {
                    name: true,
                    slug: true,
                },
            },
        },
        orderBy: [
            { degree: { name: "asc" } },
            { name: "asc" },
        ],
    });
}

/**
 * Lista disciplinas de uma matriz/série específicas.
 * Usado para ofertar novas disciplinas dentro de uma turma física.
 */
export async function getSubjectsByDegreeAndBasePeriod(
    degreeId: string,
    basePeriod: number,
): Promise<Subject[]> {
    "use cache";
    cacheLife("max");
    cacheTag(`degree:${degreeId}:subjects`);

    return await prisma.subject.findMany({
        where: {
            degreeId,
            basePeriod,
        },
        orderBy: { name: "asc" },
    });
}

/**
 * Busca uma disciplina específica pelo ID.
 *
 * @param id ID da disciplina.
 * @returns Disciplina encontrada ou null.
 */
export async function getSubjectById(id: string): Promise<Subject | null> {
    "use cache";
    cacheLife("max");
    cacheTag(`subject:${id}`);

    return await prisma.subject.findUnique({
        where: {
            id,
        },
    });
}

/**
 * Busca uma disciplina específica pelo código.
 *
 * @param code Código da disciplina.
 * @returns Disciplina encontrada ou null.
 */
export async function getSubjectByCode(code: string): Promise<Subject | null> {
    "use cache";
    cacheLife("max");
    cacheTag(`subject:code:${code}`);

    return await prisma.subject.findUnique({
        where: {
            code,
        },
    });
}

/**
 * Cria uma nova disciplina base (Subject) na Matriz.
 *
 * @param data Dados para criação da disciplina.
 * @returns Disciplina criada.
 */
export async function createSubject(data: {
    name: string;
    degreeId: string;
    code: string;
    workload?: number;
    basePeriod?: number;
}): Promise<Subject> {
    try {
        const subject = await prisma.subject.create({
            data: {
                name: data.name,
                degreeId: data.degreeId,
                code: data.code,
                workload: data.workload || null,
                basePeriod: data.basePeriod || null,
            },
        });

        return subject;
    } catch (error) {
        if (error instanceof Error && error.message.includes("Unique constraint failed")) {
            throw new Error("Já existe uma disciplina cadastrada com este código. Indique outro código.");
        }
        throw error;
    }
}

/**
 * Atualiza os dados de uma disciplina base pelo ID.
 *
 * @param id ID numérico (UUID) da disciplina.
 * @param data Dados para atualização.
 * @returns Disciplina atualizada.
 */
export async function updateSubject(
    id: string,
    data: {
        name: string;
        code: string;
        workload?: number;
        basePeriod?: number;
    },
): Promise<Subject> {
    try {
        const subject = await prisma.subject.update({
            where: {
                id,
            },
            data: {
                name: data.name,
                code: data.code,
                workload: data.workload || null,
                basePeriod: data.basePeriod || null,
            },
        });

        return subject;
    } catch (error) {
        if (error instanceof Error && error.message.includes("Unique constraint failed")) {
            throw new Error("Já existe uma outra disciplina usando este código. Tente outro.");
        }
        if (error instanceof Error && error.message.includes("Record to update not found")) {
            throw new Error("Disciplina base não encontrada.");
        }
        throw error;
    }
}

/**
 * Exclui uma disciplina base.
 *
 * @param id ID da disciplina a ser removida.
 * @returns Disciplina removida.
 */
export async function deleteSubject(id: string): Promise<Subject> {
    try {
        const subject = await prisma.subject.delete({
            where: {
                id,
            },
        });
        return subject;
    } catch (error) {
        const msg = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
        if ((error as { code?: string })?.code === "P2003" || msg.includes("foreign key constraint") || msg.includes("violates restrict")) {
            throw new Error("Não é possível excluir a disciplina porque existem turmas associadas a ela.");
        }
        if (error instanceof Error && error.message.includes("Record to delete does not exist")) {
            throw new Error("Disciplina base não encontrada.");
        }
        throw error;
    }
}
