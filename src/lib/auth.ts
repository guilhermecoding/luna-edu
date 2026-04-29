import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";
import prisma from "@/lib/prisma";
import { GENRE_VALUES } from "@/lib/genre";
import { SYSTEM_ROLE } from "@/@types/system-role.type";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
    },
    user: {
        additionalFields: {
            cpf: {
                type: "string",
                unique: true,
            },
            phone: {
                type: "string",
            },
            birthDate: {
                type: "date",
            },
            bio: {
                type: "string",
            },
            systemRole: {
                type: "string",
                values: [SYSTEM_ROLE.FULL_ACCESS, SYSTEM_ROLE.READ_ONLY],
                default: SYSTEM_ROLE.FULL_ACCESS,
            },
            isAdmin: {
                type: "boolean",
                default: false,
            },
            isTeacher: {
                type: "boolean",
                default: false,
            },
            isActive: {
                type: "boolean",
                default: true,
            },
            genre: {
                type: "string",
                values: [...GENRE_VALUES],
                default: "PREFER_NOT_TO_SAY",
            },
            lunaId: {
                type: "string",
                unique: true,
            },
        },
    },
    plugins: [
        admin(),
    ],
});