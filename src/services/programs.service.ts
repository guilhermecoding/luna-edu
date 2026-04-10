import { Program } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";
import { cacheLife, cacheTag } from "next/cache";

export async function getPrograms(): Promise<Program[]> {
    "use cache";
    cacheLife("weeks");
    cacheTag("programs");

    return await prisma.program.findMany();
}