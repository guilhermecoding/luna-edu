import prisma from "@/lib/prisma";
import { cacheLife, cacheTag } from "next/cache";
import { Prisma, SystemRole, UserGenre } from "@/generated/prisma/client";
import { generateLunaId } from "@/lib/generate-luna-id";
import { auth } from "@/lib/auth";
import { sendWelcomeEmail } from "@/lib/mail";

type CreateTeacherPayload = Pick<
    Prisma.UserCreateInput,
    "name" | "email" | "cpf" | "phone" | "birthDate" | "genre" | "systemRole"
> & {
    bio?: string | null;
};

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

export async function getTeacherStats() {
    "use cache";
    cacheLife("minutes");
    cacheTag("teachers-list");

    const [totalTeachers, activeTeachers, inactiveTeachers] = await Promise.all([
        prisma.user.count({ where: { isTeacher: true } }),
        prisma.user.count({ where: { isTeacher: true, isActive: true } }),
        prisma.user.count({ where: { isTeacher: true, isActive: false } }),
    ]);

    return {
        totalTeachers,
        activeTeachers,
        inactiveTeachers,
    };
}

export async function createTeacher(data: CreateTeacherPayload) {
    const existingCpf = await prisma.user.findUnique({ where: { cpf: data.cpf as string } });
    if (existingCpf) throw new Error("CPF_ALREADY_EXISTS");

    const lunaId = await generateLunaId();
    const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
    const signUpBody = {
        email: data.email as string,
        password: randomPassword,
        name: data.name as string,
        cpf: data.cpf as string,
        phone: data.phone as string,
        birthDate: data.birthDate as Date,
        bio: (data.bio as string) ?? "",
        genre: data.genre as UserGenre,
        systemRole: data.systemRole as SystemRole,
        isAdmin: false,
        isTeacher: true,
        isActive: true,
        lunaId,
    };

    const res = await auth.api.signUpEmail({
        body: signUpBody,
    });

    if (!res) throw new Error("AUTH_SIGNUP_FAILED_EMPTY_RESPONSE");
    if (!res.user) throw new Error("AUTH_SIGNUP_FAILED_NO_USER");

    // Envia as credenciais para o e-mail (só ocorre na criação do usuário)
    await sendWelcomeEmail({
        email: data.email as string,
        name: data.name as string,
        password: randomPassword,
        roleName: "Professor",
    });

    return res.user;
}

export async function promoteUserToTeacher(userId: string, systemRole: "FULL_ACCESS" | "READ_ONLY") {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { lunaId: true },
    });

    const lunaId = user?.lunaId || await generateLunaId();

    const teacher = await prisma.user.update({
        where: { id: userId },
        data: {
            lunaId,
            isTeacher: true,
            systemRole,
        },
    });
    return teacher;
}
