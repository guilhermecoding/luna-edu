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
    cacheLife("weeks");
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
 * Busca uma disciplina específica pelo ID.
 *
 * @param id ID da disciplina.
 * @returns Disciplina encontrada ou null.
 */
export async function getSubjectById(id: string): Promise<Subject | null> {
    "use cache";
    cacheLife("weeks");
    cacheTag(`subject:${id}`);

    return await prisma.subject.findUnique({
        where: {
            id,
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
