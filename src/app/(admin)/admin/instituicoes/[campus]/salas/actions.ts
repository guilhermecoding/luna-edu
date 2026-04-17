"use server";

import { createRoom, updateRoom, deleteRoom } from "@/services/rooms/rooms.service";
import { getCampusBySlug } from "@/services/campuses/campuses.service";
import { ZodError } from "zod";
import { roomSchema, type RoomInput } from "./schema";
import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";

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
            slug: validatedData.slug,
            campusId: campus.id,
        });

        updateTag(`campus:${campusSlug}:rooms`);
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

    redirect(`/admin/instituicoes/${campusSlug}/salas?${params.toString()}`);
}

export async function updateRoomAction(campusSlug: string, roomId: string, data: RoomInput) {
    try {
        // We might want to validate without slug if it's not editable.
        const validatedData = roomSchema.parse(data);

        await updateRoom(roomId, {
            name: validatedData.name,
            capacity: Number(validatedData.capacity),
            block: validatedData.block,
        });

        updateTag(`campus:${campusSlug}:rooms`);
        // We don't have the room slug here easily, but we can invalidate all rooms.
        revalidatePath(`/admin/instituicoes/${campusSlug}/salas`);
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
        revalidatePath(`/admin/instituicoes/${campusSlug}/salas`);
        
        return { success: true };
    } catch (error) {
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: "Erro ao excluir sala" };
    }
}
