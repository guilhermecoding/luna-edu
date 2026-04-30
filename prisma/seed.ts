import "dotenv/config";
import { auth } from "../src/lib/auth";
import prisma from "../src/lib/prisma";

const DEFAULT_ADMIN = {
    name: "Administrador",
    email: "admin@luna.com",
    password: "admin123",
    cpf: "00000000000",
    phone: "00000000000",
    birthDate: "1990-01-01",
    bio: "Usuário administrador inicial",
    lunaId: "LUNA-ADMIN-0001",
} as const;

async function seedAdmin() {
    const email = process.env.ADMIN_EMAIL ?? DEFAULT_ADMIN.email;
    const password = process.env.ADMIN_PASSWORD ?? DEFAULT_ADMIN.password;

    const existingUser = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
    });

    if (existingUser) {
        console.info(`[seed] Admin já existe para o email ${email}.`);
        return;
    }

    await auth.api.signUpEmail({
        body: {
            name: process.env.ADMIN_NAME ?? DEFAULT_ADMIN.name,
            email,
            password,
            cpf: process.env.ADMIN_CPF ?? DEFAULT_ADMIN.cpf,
            phone: process.env.ADMIN_PHONE ?? DEFAULT_ADMIN.phone,
            birthDate: new Date(process.env.ADMIN_BIRTH_DATE ?? DEFAULT_ADMIN.birthDate),
            bio: process.env.ADMIN_BIO ?? DEFAULT_ADMIN.bio,
            systemRole: "FULL_ACCESS",
            isAdmin: true,
            isTeacher: false,
            isActive: true,
            genre: "PREFER_NOT_TO_SAY",
            lunaId: process.env.ADMIN_LUNA_ID ?? DEFAULT_ADMIN.lunaId,
        },
    });

    console.info(`[seed] Admin inicial criado com sucesso: ${email}`);
}

seedAdmin()
    .catch((error) => {
        console.error("[seed] Erro ao executar seed de admin:", error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
