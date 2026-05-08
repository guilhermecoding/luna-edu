"use server";

import { updateRoom, deleteRoom, getRoomSlugById, getRoomUsageCacheRefs } from "@/services/rooms/rooms.service";
import { ZodError } from "zod";
import { roomUpdateSchema, type RoomUpdateInput } from "../../schema";
import { revalidatePath, updateTag } from "next/cache";
import { RoomType } from "@/generated/prisma/client";

export async function updateRoomAction(campusSlug: string, roomId: string, data: RoomUpdateInput) {
    try {
        const validatedData = roomUpdateSchema.parse(data);
        const roomUsageRefs = await getRoomUsageCacheRefs(roomId);

        await updateRoom(roomId, {
            name: validatedData.name,
            capacity: Number(validatedData.capacity),
            block: validatedData.block,
            type: validatedData.type as RoomType,
        });

        updateTag(`campus:${campusSlug}:rooms`);
        updateTag("all-rooms");
        for (const ref of roomUsageRefs) {
            updateTag(`period:${ref.periodId}:courses`);
            updateTag(`period:${ref.periodId}:course:${ref.courseCode}`);
            if (ref.classGroupId) {
                updateTag(`class-group:${ref.classGroupId}:courses`);
            }
            if (ref.classGroupSlug) {
                updateTag(`period:${ref.periodId}:class-group:${ref.classGroupSlug}`);
            }
            updateTag(`period:${ref.periodId}:class-groups`);
        }
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

    return {
        success: true,
        redirectTo: `/admin/instituicoes/${campusSlug}/salas?${params.toString()}`,
    };
}

export async function deleteRoomAction(campusSlug: string, roomId: string) {
    try {
        const roomUsageRefs = await getRoomUsageCacheRefs(roomId);
        await deleteRoom(roomId);

        updateTag(`campus:${campusSlug}:rooms`);
        updateTag("all-rooms");
        for (const ref of roomUsageRefs) {
            updateTag(`period:${ref.periodId}:courses`);
            updateTag(`period:${ref.periodId}:course:${ref.courseCode}`);
            if (ref.classGroupId) {
                updateTag(`class-group:${ref.classGroupId}:courses`);
            }
            if (ref.classGroupSlug) {
                updateTag(`period:${ref.periodId}:class-group:${ref.classGroupSlug}`);
            }
            updateTag(`period:${ref.periodId}:class-groups`);
        }
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

    return {
        success: true,
        redirectTo: `/admin/instituicoes/${campusSlug}/salas?${params.toString()}`,
    };
}
