"use server";

import { createRoom } from "@/services/rooms/rooms.service";
import { getCampusBySlug } from "@/services/campuses/campuses.service";
import { ZodError } from "zod";
import { roomSchema, type RoomInput } from "../schema";
import { revalidatePath, updateTag } from "next/cache";
import { RoomType } from "@/generated/prisma/client";

export async function createRoomAction(campusSlug: string, data: RoomInput) {
    try {
        const validatedData = roomSchema.parse(data);
        const campus = await getCampusBySlug(campusSlug);

        if (!campus) {
            throw new Error("Campus não encontrado.");
        }

        await createRoom({
            name: validatedData.name,
            capacity: Number(validatedData.capacity),
            block: validatedData.block,
            type: validatedData.type as RoomType,
            slug: validatedData.slug,
            campusId: campus.id,
        });

        updateTag(`campus:${campusSlug}:rooms`);
        updateTag("all-rooms");
        revalidatePath(`/admin/instituicoes/${campusSlug}/salas`);
    } catch (error) {
        if (error instanceof ZodError) {
            return { success: false, error: error.issues[0]?.message || "Erro de validação" };
        }
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: "Erro ao criar sala" };
    }

    const params = new URLSearchParams({
        toast: "success",
        message: "Sala criada com sucesso",
    });

    return {
        success: true,
        redirectTo: `/admin/instituicoes/${campusSlug}/salas?${params.toString()}`,
    };
}
