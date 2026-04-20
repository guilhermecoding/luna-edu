import { getRoomsByCampus } from "@/services/rooms/rooms.service";
import { IconDoor, IconEdit, IconUsers, IconBuilding, IconChevronRight } from "@tabler/icons-react";
import Link from "next/link";
import { Suspense } from "react";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { RoomType } from "@/generated/prisma/enums";

function roomType(type: RoomType) {
    switch (type) {
        case RoomType.CLASSROOM:
            return "Sala de Aula";
        case RoomType.LABORATORY:
            return "Laboratório";
        case RoomType.AUDITORIUM:
            return "Auditório";
        case RoomType.OTHERS:
            return "Outro";
    }
}

function ListRoomsSkeleton() {
    return (
        <div className="overflow-x-auto rounded-4xl border border-surface-border bg-surface">
            <table className="w-full text-left border-collapse">
                <thead className="bg-primary/5 text-muted-foreground uppercase text-xs">
                    <tr>
                        <th className="px-6 py-4 font-medium">Sala / Laboratório</th>
                        <th className="px-6 py-4 font-medium text-center">Capacidade</th>
                        <th className="px-6 py-4 font-medium text-center">Bloco / Prédio</th>
                        <th className="px-6 py-4 font-medium text-right">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i}>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="size-10 rounded-lg bg-muted-foreground/10" />
                                    <Skeleton className="h-6 w-32 bg-muted-foreground/10" />
                                </div>
                            </td>
                            <td className="px-6 py-4 flex justify-center">
                                <Skeleton className="h-6 w-20 rounded-full bg-muted-foreground/10" />
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex justify-center">
                                    <Skeleton className="h-6 w-24 rounded-full bg-muted-foreground/10" />
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex justify-end gap-2">
                                    <Skeleton className="size-8 rounded-lg bg-muted-foreground/10" />
                                    <Skeleton className="h-8 w-20 rounded-lg bg-muted-foreground/10" />
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}


function EmptyRoomsList({ campusSlug }: { campusSlug: string }) {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-surface-border rounded-4xl">
            <IconDoor className="size-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-semibold">Nenhuma sala cadastrada</h3>
            <p className="text-muted-foreground mt-2 max-w-sm mb-6">
                Comece cadastrando as salas disponíveis neste local.
            </p>
            <Link href={`/admin/instituicoes/${campusSlug}/salas/novo`} className="text-primary hover:underline text-sm font-medium">
                + Adicionar a primeira sala
            </Link>
        </div>
    );
}

async function ListRoomsContent({ campusSlug }: { campusSlug: string }) {
    const rooms = await getRoomsByCampus(campusSlug);

    if (rooms.length === 0) {
        return <EmptyRoomsList campusSlug={campusSlug} />;
    }

    return (
        <div className="overflow-x-auto rounded-4xl border border-surface-border bg-surface text-sm">
            <table className="w-full text-left border-collapse">

                <thead className="bg-primary/5 text-muted-foreground uppercase text-[10px] sm:text-xs">
                    <tr>
                        <th className="px-4 sm:px-6 py-4 font-medium min-w-[180px]">Sala / Laboratório</th>
                        <th className="px-4 sm:px-6 py-4 font-medium text-center min-w-[120px]">Capacidade</th>
                        <th className="px-4 sm:px-6 py-4 font-medium text-center min-w-[120px]">Bloco / Prédio</th>
                        <th className="px-4 sm:px-6 py-4 font-medium text-center whitespace-nowrap min-w-[140px]">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                    {rooms.map((room) => (
                        <tr key={room.id} className="hover:bg-muted/50 transition-colors group">
                            <td className="px-4 sm:px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex justify-center items-center bg-background border border-surface-border size-8 sm:size-10 rounded-lg text-primary shrink-0 transition-transform group-hover:scale-105">
                                        <IconDoor className="size-4 sm:size-5" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-sm sm:text-base text-foreground uppercase" title={room.name}>
                                            {room.name}
                                        </span>
                                        <span className="text-muted-foreground text-[10px] sm:text-xs">{roomType(room.type)}</span>
                                    </div>
                                </div>
                            </td>
                            <td className="px-4 sm:px-6 py-4">
                                <div className="flex justify-center">
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary font-medium text-[10px] sm:text-xs whitespace-nowrap">
                                        <IconUsers className="size-3 sm:size-3.5" />
                                        {room.capacity} {Number(room.capacity) === 1 ? "vaga" : "vagas"}
                                    </div>
                                </div>
                            </td>
                            <td className="px-4 sm:px-6 py-4">
                                <div className="flex justify-center">
                                    {room.block ? (
                                        <div className="flex flex-row items-center gap-1.5 px-3 py-1 rounded-full bg-muted text-muted-foreground font-medium text-[10px] sm:text-xs whitespace-nowrap">
                                            <IconBuilding className="size-3 sm:size-3.5" />
                                            Bloco {room.block}
                                        </div>
                                    ) : (
                                        <span className="text-muted-foreground/50 text-[10px] sm:text-xs italic whitespace-nowrap">Não informado</span>
                                    )}
                                </div>
                            </td>
                            <td className="px-4 sm:px-6 py-4">
                                <div className="flex flex-row items-center justify-center sm:justify-end gap-1 sm:gap-2">
                                    <Link
                                        href={`/admin/instituicoes/${campusSlug}/salas/${room.slug}/editar`}
                                        className="p-2 inline-flex rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-muted-foreground transition-colors shrink-0"
                                        title="Editar sala"
                                    >
                                        <IconEdit className="size-4 sm:size-5" />
                                    </Link>

                                    <Separator orientation="vertical" className="h-4 bg-surface-border block mt-2.5" />

                                    <Link
                                        href={`/admin/instituicoes/${campusSlug}/salas/${room.slug}/editar`}
                                        className="text-primary hover:text-primary/80 text-[10px] sm:text-sm font-bold flex items-center gap-1 transition-colors px-2 py-1 rounded-lg hover:bg-primary/5 whitespace-nowrap shrink-0"
                                    >
                                        <span className="">Detalhes</span>
                                        <IconChevronRight className="size-3 sm:size-4" />
                                    </Link>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default function ListRooms({ campusSlug }: { campusSlug: string }) {
    return (
        <Suspense fallback={<ListRoomsSkeleton />}>
            <ListRoomsContent campusSlug={campusSlug} />
        </Suspense>
    );
}
