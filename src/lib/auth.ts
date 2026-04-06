import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "@/lib/prisma";

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
                values: ["FULL_ACCESS", "READ_ONLY"],
                default: "FULL_ACCESS",
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
        },
    },
});