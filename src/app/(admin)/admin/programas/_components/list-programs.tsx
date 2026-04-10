import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Program } from "@/generated/prisma/client";
import { getPrograms } from "@/services/programs.service";
import { IconChevronRight, IconDots, IconExternalLinkFilled, IconPencilFilled } from "@tabler/icons-react";
import Link from "next/link";
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
        <div className="w-full h-18 flex justify-center items-center">
            <h1 className="text-muted-foreground text-base sm:text-lg font-medium text-center">
                Ops! Não há programas de aprendizado disponíveis. <br />
                Comece criando um programa.
            </h1>
        </div>
    );
}

function ProgramItem({
    programas,
}: {
    programas: Program;
}) {
    return (
        <div
            className="flex flex-col border border-muted-foreground/40 p-4 rounded-4xl gap-2 w-full hover:bg-muted transition-colors sm:w-64"
        >
            <div className="flex-1 min-w-0">
                <h1 className="font-bold truncate">
                    {programas.name}
                </h1>
                <p className="text-sm text-muted-foreground truncate">
                    {programas.slug}
                </p>
            </div>
            <Separator className="my-1" />
            <div className="flex flex-row justify-between items-center px-4 shrink-0">
                <Link href={`/admin/${programas.slug}/editar`} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
                    <IconPencilFilled className="size-3.5" />
                    <span>Editar</span>
                </Link>
                <Separator orientation="vertical" />
                <Link href={`/admin/${programas.slug}/periodos`} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
                    <IconExternalLinkFilled className="size-3.5" />
                    <span>Acessar</span>
                </Link>
            </div>
        </div>
    );
}

export async function ListProgramsContent() {
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
                    <ProgramItem key={program.id} programas={program} />
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
