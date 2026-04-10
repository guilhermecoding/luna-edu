import { Program } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";
import { cacheLife, cacheTag, revalidateTag } from "next/cache";

export async function getPrograms(): Promise<Program[]> {
    "use cache";
    cacheLife("weeks");
    cacheTag("programs");

    return await prisma.program.findMany();
}

export async function createProgram(data: {
    name: string;
    slug: string;
    description?: string;
}): Promise<Program> {
    try {
        const program = await prisma.program.create({
            data: {
                name: data.name,
                slug: data.slug,
                description: data.description,
            },
        });

        revalidateTag("programs", "weeks");
        return program;
    } catch (error) {
        if (error instanceof Error && error.message.includes("Unique constraint failed")) {
            throw new Error("Já existe um programa com este slug");
        }
        throw error;
    }
}