"use server";

import { updateRoom, deleteRoom, getRoomSlugById } from "@/services/rooms/rooms.service";
import { ZodError } from "zod";
import { roomUpdateSchema, type RoomUpdateInput } from "../../schema";
import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { RoomType } from "@/generated/prisma/client";

export async function updateRoomAction(campusSlug: string, roomId: string, data: RoomUpdateInput) {
    try {
        const validatedData = roomUpdateSchema.parse(data);

        await updateRoom(roomId, {
            name: validatedData.name,
            capacity: Number(validatedData.capacity),
            block: validatedData.block,
            type: validatedData.type as RoomType,
        });

        updateTag(`campus:${campusSlug}:rooms`);
        updateTag("all-rooms");
        const roomSlug = await getRoomSlugById(roomId);
        revalidatePath(`/admin/instituicoes/${campusSlug}/salas`);
        if (roomSlug) {
            revalidatePath(`/admin/instituicoes/${campusSlug}/salas/${roomSlug}/editar`);
        }
    } catch (error) {
        if (error instanceof ZodError) {
            return { success: false, error: error.issues[0]?.message || "Erro de validação" };
        }
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: "Erro ao atualizar sala" };
    }

    const params = new URLSearchParams({
        toast: "success",
        message: "Sala atualizada com sucesso",
    });

    redirect(`/admin/instituicoes/${campusSlug}/salas?${params.toString()}`);
}

export async function deleteRoomAction(campusSlug: string, roomId: string) {
    try {
        await deleteRoom(roomId);

        updateTag(`campus:${campusSlug}:rooms`);
        updateTag("all-rooms");
        revalidatePath(`/admin/instituicoes/${campusSlug}/salas`);
    } catch (error) {
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: "Erro ao excluir sala" };
    }

    const params = new URLSearchParams({
        toast: "success",
        message: "Sala excluída com sucesso",
    });

    redirect(`/admin/instituicoes/${campusSlug}/salas?${params.toString()}`);
}
