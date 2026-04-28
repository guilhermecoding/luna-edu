import prisma from "@/lib/prisma";
import { cacheLife, cacheTag } from "next/cache";
import { Prisma } from "@/generated/prisma/client";


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

/**
 * Retorna a lista de usuários do sistema (administradores ou professores),
 * com opção de filtro pelo nome.
 */
export async function getUsersList(query?: string) {
    "use cache";
    cacheLife("minutes");
    cacheTag("users-list");

    return await prisma.user.findMany({
        where: {
            OR: [
                { isAdmin: true },
                { isTeacher: true },
            ],
            ...(query ? {
                name: {
                    contains: query,
                    mode: "insensitive" as Prisma.QueryMode,
                },
            } : {}),
        },
        select: {
            id: true,
            lunaId: true,
            name: true,
            email: true,
            isActive: true,
            isAdmin: true,
            isTeacher: true,
            systemRole: true,
            birthDate: true,
            genre: true,
        },
        orderBy: {
            name: "asc",
        },
    });
}

/**
 * Busca um membro da equipe (admin ou professor) pelo ID.
 */
export async function getUserById(id: string) {
    "use cache";
    cacheLife("minutes");
    cacheTag(`user-${id}`);

    return await prisma.user.findUnique({
        where: { id },
    });
}

/**
 * Atualiza um membro da equipe, validando CPF único.
 */
export async function updateUser(id: string, data: Prisma.UserUpdateInput) {
    if (data.cpf) {
        const existingCpf = await prisma.user.findFirst({ where: { cpf: data.cpf as string, id: { not: id } } });
        if (existingCpf) throw new Error("CPF_ALREADY_EXISTS");
    }

    return await prisma.user.update({
        where: { id },
        data,
    });
}

export type UserListItem = Awaited<ReturnType<typeof getUsersList>>[number];
