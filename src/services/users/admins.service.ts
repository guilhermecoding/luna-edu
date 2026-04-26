import prisma from "@/lib/prisma";
import { cacheLife, cacheTag } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import { generateLunaId } from "@/lib/generate-luna-id";

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
    const lunaId = await generateLunaId();
    const admin = await prisma.user.create({
        data: {
            ...data,
            lunaId,
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
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { lunaId: true },
    });

    const lunaId = user?.lunaId || await generateLunaId();

    const admin = await prisma.user.update({
        where: { id: userId },
        data: {
            lunaId,
            isAdmin: true,
            systemRole,
        },
    });
    return admin;
}
