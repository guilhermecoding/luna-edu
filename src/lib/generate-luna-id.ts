import prisma from "./prisma";

/**
 * Gera um ID de Matrícula sequencial baseado no ano atual.
 * Formato: YYYYXXXXX (ex: 202600001)
 */
export async function generateLunaId() {
    const year = new Date().getFullYear().toString(); // 2026
    const prefix = year;

    // Busca o maior ID que comece com o ano atual em User e Student para garantir unicidade global
    const [lastUser, lastStudent] = await Promise.all([
        prisma.user.findFirst({
            where: { lunaId: { startsWith: prefix } },
            orderBy: { lunaId: "desc" },
            select: { lunaId: true },
        }),
        prisma.student.findFirst({
            where: { lunaId: { startsWith: prefix } },
            orderBy: { lunaId: "desc" },
            select: { lunaId: true },
        }),
    ]);

    const getSeq = (id: string | null | undefined) => {
        if (!id) return 0;
        const seqPart = id.slice(prefix.length);
        return parseInt(seqPart) || 0;
    };

    const userSeq = getSeq(lastUser?.lunaId);
    const studentSeq = getSeq(lastStudent?.lunaId);
    
    const sequence = Math.max(userSeq, studentSeq) + 1;

    // Retorna Ano + Sequencial com 5 dígitos (ex: 202600001)
    return `${prefix}${sequence.toString().padStart(5, "0")}`;
}
