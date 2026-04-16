import { getDegreesByProgramId } from "@/services/degrees/degrees.service";
import { IconBook, IconEdit, IconChevronRight, IconHash, IconClock, IconBlocks, IconUnlink, IconEye } from "@tabler/icons-react";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button-link";
import { Degree } from "@/generated/prisma/client";
import { Suspense } from "react";
import { Separator } from "@/components/ui/separator";

function ListDegreesSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="border rounded-xl p-6 bg-background shadow-sm flex flex-col items-start">
                    <div className="flex bg-primary/10 p-3 rounded-lg mb-4 text-primary">
                        <IconBook className="size-6" />
                    </div>
                    <div className="flex-1 w-full">
                        <h4 className="text-lg font-semibold line-clamp-1">Matriz Curricular</h4>
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mt-1 mb-3">
                            <span className="bg-secondary px-2 py-0.5 rounded-full">slug</span>
                            <span className="bg-secondary px-2 py-0.5 rounded-full">120h</span>
                        </div>
                        <p className="text-sm text-balance text-muted-foreground line-clamp-2 mt-2">
                            Descrição da matriz curricular
                        </p>
                    </div>

                    <div className="w-full flex items-center justify-between mt-6 pt-4 border-t">
                        <Link
                            href="#"
                            className="text-muted-foreground hover:text-foreground text-sm flex items-center gap-1 transition-colors"
                        >
                            <IconEdit className="size-4" />
                            Editar
                        </Link>

                        <Link
                            href="#"
                            className="text-primary hover:text-primary/80 text-sm font-medium flex items-center gap-1 transition-colors"
                        >
                            Ver Disciplinas
                            <IconChevronRight className="size-4" />
                        </Link>
                    </div>
                </div>
            ))}
        </div>
    );
}

function EmptyListDegrees({ programSlug }: { programSlug: string }) {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-center border rounded-xl bg-background shadow-sm">
            <IconBook className="size-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-semibold">Nenhuma matriz curricular</h3>
            <p className="text-muted-foreground mt-2 max-w-sm mb-6">
                Você ainda não adicionou nenhuma matriz curricular para este programa. Comece criando a primeira.
            </p>
            <ButtonLink href={`/admin/${programSlug}/matrizes/novo`}>
                Criar Primeira Matriz
            </ButtonLink>
        </div>
    );
}

function DegreeTag({
    icon,
    value,
}: {
    icon: React.ReactNode;
    value: string;
}) {
    return (
        <div className="flex flex-row items-center gap-1 whitespace-nowrap font-medium bg-primary text-white dark:text-black px-2 py-1 rounded-full">
            {icon}
            <span>
                {value}
            </span>
        </div>
    );
}

async function ListDegreesContent({
    degrees,
    programSlug,
}: {
    degrees: Promise<Degree[]>;
    programSlug: string;
}) {
    const degreesData = await degrees;

    if (degreesData.length === 0) {
        return (
            <EmptyListDegrees programSlug={programSlug} />
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {degreesData.map((degree) => (
                <div key={degree.id} className="border border-surface-border rounded-4xl p-6 bg-surface flex flex-col items-start hover:border-primary/50 transition-colors">
                    <div className="flex bg-background border border-surface-border p-3 rounded-lg mb-4 text-primary">
                        <IconBlocks className="size-6" />
                    </div>
                    <div className="flex-1 w-full">
                        <h4 className="text-2xl sm:text-3xl capitalize font-semibold line-clamp-2" title={degree.name}>{degree.name}</h4>
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground my-3">
                            <DegreeTag icon={<IconUnlink className="size-4" />} value={degree.slug} />
                            {degree.totalHours && <DegreeTag icon={<IconClock className="size-4" />} value={`${degree.totalHours}h`} />}
                            {degree.modality && <DegreeTag icon={<IconEye className="size-4" />} value={degree.modality} />}
                            {degree.level && <DegreeTag icon={<IconBook className="size-4" />} value={degree.level} />}
                        </div>
                        {degree.description && (
                            <p className="text-sm text-balance text-muted-foreground line-clamp-2 mt-2">
                                {degree.description}
                            </p>
                        )}
                    </div>

                    <div className="w-full flex items-center justify-between mt-6 pt-4 px-4 border-t">
                        <Link
                            href={`/admin/${programSlug}/matrizes/${degree.slug}/editar`}
                            className="text-muted-foreground hover:text-foreground text-sm flex items-center gap-1 transition-colors"
                        >
                            <IconEdit className="size-4" />
                            Editar
                        </Link>

                        <Separator orientation="vertical" className="h-6 border" />

                        <Link
                            href={`/admin/${programSlug}/matrizes/${degree.slug}`}
                            className="text-primary hover:text-primary/80 text-sm font-medium flex items-center gap-1 transition-colors"
                        >
                            Ver Disciplinas
                            <IconChevronRight className="size-4" />
                        </Link>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function ListDegrees({
    programId,
    programSlug,
}: {
    programId: string;
    programSlug: string;
}) {
    return (
        <Suspense fallback={<ListDegreesSkeleton />}>
            <ListDegreesContent degrees={getDegreesByProgramId(programId)} programSlug={programSlug} />
        </Suspense>
    );
}
