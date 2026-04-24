import prisma from "@/lib/prisma";
import { cacheLife, cacheTag } from "next/cache";

/**
 * Retorna as estatísticas de usuários: total de usuários, quantidade de administradores e quantidade de professores.
 * Otimizado com agrupamento para buscar os dados em uma única query.
 */
export async function getUserStats(): Promise<{ totalUsers: number; totalAdmins: number; totalTeachers: number }> {
    "use cache";
    cacheLife("days");
    cacheTag("users-stats");

    const stats = await prisma.user.groupBy({
        by: ["isAdmin", "isTeacher"],
        _count: {
            _all: true,
        },
    });

    let totalUsers = 0;
    let totalAdmins = 0;
    let totalTeachers = 0;

    for (const group of stats) {
        totalUsers += group._count._all;
        if (group.isAdmin) {
            totalAdmins += group._count._all;
        }
        if (group.isTeacher) {
            totalTeachers += group._count._all;
        }
    }

    return { totalUsers, totalAdmins, totalTeachers };
}
