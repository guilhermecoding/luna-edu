import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Program } from "@/generated/prisma/client";
import { getPrograms } from "@/services/programs/programs.service";
import { IconBlocks, IconExternalLinkFilled, IconPencilFilled } from "@tabler/icons-react";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";

function ListProgramsSkeleton() {
    return (
        <div className="flex flex-wrap gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="w-full sm:w-64 h-22 rounded-4xl" />
            ))}
        </div>
    );
}

function EmptyList() {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-surface-border rounded-4xl">
            <IconBlocks className="size-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-semibold">Nenhum programa cadastrado</h3>
            <p className="text-muted-foreground mt-2 max-w-sm mb-6">
                Programas de aprendizado organizam períodos, matrizes curriculares e disciplinas. Comece criando o primeiro programa.
            </p>
            <Link href="/admin/programas/novo" className="text-primary hover:underline text-sm font-medium">
                + Adicionar o primeiro programa
            </Link>
        </div>
    );
}

function ProgramItem({
    programa,
}: {
    programa: Program;
}) {
    return (
        <div
            className="flex flex-col border border-muted-foreground/40 p-4 rounded-4xl gap-2 w-full bg-surface transition-colors sm:w-64"
        >
            <div className="flex-1 min-w-0">
                <h1 className="font-bold truncate">
                    {programa.name}
                </h1>
                <p className="text-sm text-muted-foreground truncate">
                    {programa.slug}
                </p>
            </div>
            <Separator className="my-1" />
            <div className="flex flex-row justify-between items-center px-4 shrink-0">
                <Link href={`/admin/programas/${programa.slug}/editar`} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
                    <IconPencilFilled className="size-3.5" />
                    <span>Editar</span>
                </Link>
                <Separator orientation="vertical" />
                <Link href={`/admin/${programa.slug}/periodos`} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
                    <IconExternalLinkFilled className="size-3.5" />
                    <span>Acessar</span>
                </Link>
            </div>
        </div>
    );
}

export async function ListProgramsContent() {
    await connection();
    const programs = await getPrograms();

    if (programs.length === 0) {
        return <EmptyList />;
    }

    return (
        <div className="space-y-4">
            <div>
                <h3>Programas disponíveis ({programs.length}):</h3>
            </div>
            <div className="flex flex-wrap gap-4">
                {programs.map((program) => (
                    <ProgramItem key={program.id} programa={program} />
                ))}
            </div>
        </div>
    );
}


export default function ListPrograms() {

    return (
        <Suspense fallback={<ListProgramsSkeleton />}>
            <ListProgramsContent />
        </Suspense>
    );
}
