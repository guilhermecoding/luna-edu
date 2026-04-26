import prisma from "@/lib/prisma";
import { cacheLife, cacheTag } from "next/cache";
import { Prisma } from "@/generated/prisma/client";

export async function getAdmins(query?: string) {
    "use cache";
    cacheLife("minutes");
    cacheTag("admins-list");

    return await prisma.user.findMany({
        where: {
            isAdmin: true,
            ...(query ? {
                name: {
                    contains: query,
                    mode: "insensitive" as Prisma.QueryMode,
                },
            } : {}),
        },
        orderBy: { name: "asc" },
    });
}

export async function getAdminById(id: string) {
    "use cache";
    cacheLife("minutes");
    cacheTag(`admin-${id}`);

    return await prisma.user.findUnique({
        where: { id },
    });
}

export async function createAdmin(data: Prisma.UserCreateInput) {
    const admin = await prisma.user.create({
        data: {
            ...data,
            isAdmin: true,
        },
    });
    return admin;
}

export async function updateAdmin(id: string, data: Prisma.UserUpdateInput) {
    const admin = await prisma.user.update({
        where: { id },
        data,
    });
    return admin;
}

export async function promoteUserToAdmin(userId: string, systemRole: "FULL_ACCESS" | "READ_ONLY") {
    const admin = await prisma.user.update({
        where: { id: userId },
        data: {
            isAdmin: true,
            systemRole,
        },
    });
    return admin;
}
