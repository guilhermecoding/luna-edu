import prisma from "@/lib/prisma";
import { cacheLife, cacheTag } from "next/cache";
import { Prisma } from "@/generated/prisma/client";

export async function getTeachers(query?: string) {
    "use cache";
    cacheLife("minutes");
    cacheTag("teachers-list");

    return await prisma.user.findMany({
        where: {
            isTeacher: true,
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
