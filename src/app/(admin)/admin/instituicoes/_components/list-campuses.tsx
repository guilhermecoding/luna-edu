import { getCampuses } from "@/services/campuses/campuses.service";
import { IconBuildingCommunity, IconPencil, IconMapPinFilled, IconDoor, IconEye } from "@tabler/icons-react";
import Link from "next/link";
import { Suspense } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button-link";
import { connection } from "next/server";

function EmptyCampusesList() {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-surface-border rounded-4xl">
            <IconBuildingCommunity className="size-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-semibold">Nenhuma instituição cadastrada</h3>
            <p className="text-muted-foreground mt-2 max-w-sm mb-6">
                Comece cadastrando sua primeira instituição ou campus para poder gerenciar as salas e turmas.
            </p>
            <Link href="/admin/instituicoes/novo" className="text-primary hover:underline text-sm font-medium">
                + Adicionar a primeira instituição
            </Link>
        </div>
    );
}

async function ListCampusesContent() {
    await connection(); // Diz pro Next.js que este trecho de código depende do banco de dados

    const campuses = await getCampuses();

    if (campuses.length === 0) {
        return (
            <EmptyCampusesList />
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {campuses.map((campus) => (
                <Card key={campus.id} className="flex flex-col group">
                    <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
                        <div className="flex justify-between items-start gap-4">
                            <CardTitle className="text-xl font-bold leading-tight">
                                {campus.name}
                            </CardTitle>
                            <Link
                                href={`/admin/instituicoes/${campus.slug}/editar`}
                                className="p-2 shrink-0 rounded-md hover:bg-black/5 dark:hover:bg-white/10 text-muted-foreground transition-colors"
                                title="Editar instituição"
                            >
                                <IconPencil className="size-4" />
                            </Link>
                        </div>
                    </CardHeader>

                    <CardContent className="flex-1 pt-5 space-y-4">
                        <div className="flex items-start gap-3 text-muted-foreground">
                            <IconMapPinFilled className="size-5 shrink-0 text-primary/70 mt-0.5" />
                            <span className="text-sm leading-snug">
                                {campus.address || "Endereço não cadastrado"}
                            </span>
                        </div>

                        <div className="flex items-center gap-3 text-muted-foreground">
                            <IconDoor className="size-5 shrink-0 text-primary/70" />
                            <span className="text-sm font-medium">
                                {campus._count.rooms} {campus._count.rooms === 1 ? "sala" : "salas"}
                            </span>
                        </div>
                    </CardContent>

                    <CardFooter className="pt-4 pb-5">
                        <ButtonLink
                            href={`/admin/instituicoes/${campus.slug}/salas`}
                            variant="secondary"
                            className="w-full flex justify-center items-center gap-2"
                        >
                            <IconEye className="size-4" />
                            Gerenciar Salas
                        </ButtonLink>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}

export default function ListCampuses() {
    return (
        <Suspense fallback={null}>
            <ListCampusesContent />
        </Suspense>
    );
}
