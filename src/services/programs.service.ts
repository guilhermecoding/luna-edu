import { Program } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";

export async function getPrograms(): Promise<Program[]> {
    return await prisma.program.findMany();
}