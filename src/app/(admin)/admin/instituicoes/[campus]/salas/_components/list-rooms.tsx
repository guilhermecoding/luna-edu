import { getRoomsByCampus } from "@/services/rooms/rooms.service";
import { IconDoor, IconEdit, IconUsers, IconBuilding, IconChevronRight } from "@tabler/icons-react";
import Link from "next/link";
import { Suspense } from "react";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

function ListRoomsSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-4xl p-6 bg-muted flex flex-col items-start">
                    <div className="flex p-3 rounded-lg mb-4 text-primary">
                        <Skeleton className="size-9 rounded-lg bg-muted-foreground/20" />
                    </div>
                    <div className="flex-1 w-full space-y-3">
                        <Skeleton className="h-8 w-3/4 bg-muted-foreground/20" />
                        <div className="flex flex-wrap gap-2 my-3">
                            <Skeleton className="h-5 w-16 rounded-full bg-muted-foreground/20" />
                            <Skeleton className="h-5 w-20 rounded-full bg-muted-foreground/20" />
                        </div>
                    </div>

                    <div className="w-full flex items-center justify-between mt-6 pt-4 px-4 border-t gap-4">
                        <Skeleton className="h-4 w-12 bg-muted-foreground/20" />
                    </div>
                </div>
            ))}
        </div>
    );
}

function RoomTag({
    icon,
    value,
}: {
    icon: React.ReactNode;
    value: string;
}) {
    return (
        <div className="flex flex-row items-center gap-1 whitespace-nowrap font-medium bg-primary text-white dark:text-black px-2 py-1 rounded-full">
            {icon}
            <span>{value}</span>
        </div>
    );
}

function EmptyRoomsList({ campusSlug }: { campusSlug: string }) {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-surface-border rounded-4xl">
            <IconDoor className="size-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-semibold">Nenhuma sala cadastrada</h3>
            <p className="text-muted-foreground mt-2 max-w-sm mb-6">
                Comece cadastrando as salas e laboratórios disponíveis neste campus.
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room, index) => (
                <div key={room.id} className="border border-surface-border rounded-4xl p-6 bg-surface flex flex-col items-start hover:border-primary/50 transition-colors">
                    <div className="flex justify-center items-center bg-background border border-surface-border size-12 p-3 rounded-lg mb-4 text-primary">
                        <IconDoor className="size-6" />
                    </div>

                    <div className="flex-1 w-full">
                        <h4 className="text-2xl sm:text-3xl capitalize font-semibold line-clamp-2" title={room.name}>
                            {room.name}
                        </h4>

                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground my-3">
                            <RoomTag
                                icon={<IconUsers className="size-4" />}
                                value={`${room.capacity} ${Number(room.capacity) === 1 ? "vaga" : "vagas"}`}
                            />
                            {room.block && (
                                <RoomTag icon={<IconBuilding className="size-4" />} value={`Bloco ${room.block}`} />
                            )}
                        </div>
                    </div>

                    <div className="w-full flex items-center justify-between mt-6 pt-4 px-4 border-t">
                        <Link
                            href={`/admin/instituicoes/${campusSlug}/salas/${room.slug}/editar`}
                            className="text-muted-foreground hover:text-foreground text-sm flex items-center gap-1 transition-colors"
                        >
                            <IconEdit className="size-4" />
                            Editar
                        </Link>

                        <Separator orientation="vertical" className="h-6 border" />

                        <Link
                            href={`/admin/instituicoes/${campusSlug}/salas/${room.slug}/editar`}
                            className="text-primary hover:text-primary/80 text-sm font-medium flex items-center gap-1 transition-colors"
                        >
                            Ver Detalhes
                            <IconChevronRight className="size-4" />
                        </Link>
                    </div>
                </div>
            ))}
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
