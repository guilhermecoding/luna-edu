import prisma from "@/lib/prisma";
import { cacheLife, cacheTag } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import { SystemRole, UserGenre } from "@/generated/prisma/client";
import { generateLunaId } from "@/lib/generate-luna-id";
import { auth } from "@/lib/auth";

type CreateAdminPayload = Pick<
    Prisma.UserCreateInput,
    "name" | "email" | "cpf" | "phone" | "birthDate" | "genre" | "systemRole"
> & {
    bio?: string | null;
};

/**
 * Lista usuários administradores, com filtro opcional por nome.
 *
 * @param query Termo opcional para filtrar por nome (case-insensitive).
 * @returns Lista de administradores ordenada por nome.
 */
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

/**
 * Busca um administrador pelo ID.
 *
 * @param id ID do usuário administrador.
 * @returns O administrador encontrado ou `null` quando não existe.
 */
export async function getAdminById(id: string) {
    "use cache";
    cacheLife("minutes");
    cacheTag(`admin-${id}`);

    return await prisma.user.findUnique({
        where: { id },
    });
}

/**
 * Cria um novo administrador via Better Auth, validando CPF único.
 *
 * @param data Dados de criação do usuário administrador.
 * @returns Usuário criado no processo de cadastro.
 * @throws Error quando o CPF já está em uso (`CPF_ALREADY_EXISTS`).
 */
export async function createAdmin(data: CreateAdminPayload) {
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
        isAdmin: true,
        isTeacher: false,
        isActive: true,
        lunaId,
    };

    const res = await auth.api.signUpEmail({
        body: signUpBody,
    });

    if (!res) {
        throw new Error("AUTH_SIGNUP_FAILED_EMPTY_RESPONSE");
    }

    if (!res.user) {
        throw new Error("AUTH_SIGNUP_FAILED_NO_USER");
    }

    return res.user;
}

/**
 * Atualiza um administrador existente, validando CPF único quando informado.
 *
 * @param id ID do administrador a ser atualizado.
 * @param data Campos de atualização do administrador.
 * @returns Administrador atualizado.
 * @throws Error quando o CPF já está em uso por outro usuário (`CPF_ALREADY_EXISTS`).
 */
export async function updateAdmin(id: string, data: Prisma.UserUpdateInput) {
    if (data.cpf) {
        const existingCpf = await prisma.user.findFirst({ where: { cpf: data.cpf as string, id: { not: id } } });
        if (existingCpf) throw new Error("CPF_ALREADY_EXISTS");
    }

    const admin = await prisma.user.update({
        where: { id },
        data,
    });
    return admin;
}

/**
 * Promove um usuário existente para administrador.
 *
 * @param userId ID do usuário que será promovido.
 * @param systemRole Nível de acesso administrativo atribuído.
 * @returns Usuário atualizado com perfil de administrador.
 */
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
