import { getClassGroupsByPeriodId } from "@/services/class-groups/class-groups.service";
import { IconUsersGroup, IconEdit, IconChevronRight, IconBlocks, IconBook, IconClock } from "@tabler/icons-react";
import Link from "next/link";
import { Fragment, Suspense } from "react";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { shiftLabels } from "../schema";

function ListClassGroupsSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="border border-surface-border rounded-2xl bg-surface p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Skeleton className="size-10 rounded-xl bg-muted-foreground/10" />
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-5 w-28 bg-muted-foreground/10" />
                            <Skeleton className="h-3 w-20 bg-muted-foreground/10" />
                        </div>
                    </div>
                    <Skeleton className="h-4 w-full bg-muted-foreground/10 mb-2" />
                    <Skeleton className="h-4 w-2/3 bg-muted-foreground/10" />
                </div>
            ))}
        </div>
    );
}

function EmptyClassGroupsList({
    programSlug,
    periodSlug,
}: {
    programSlug: string;
    periodSlug: string;
}) {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-surface-border rounded-4xl">
            <IconUsersGroup className="size-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-semibold">Nenhuma classe cadastrada</h3>
            <p className="text-muted-foreground mt-2 max-w-sm mb-6">
                Crie uma classe selecionando a Matriz e a Série. O sistema criará automaticamente as disciplinas ofertadas.
            </p>
            <Link
                href={`/admin/${programSlug}/periodos/${periodSlug}/turmas/novo`}
                className="text-primary hover:underline text-sm font-medium"
            >
                + Criar a primeira classe
            </Link>
        </div>
    );
}

async function ListClassGroupsContent({
    periodId,
    programSlug,
    periodSlug,
}: {
    periodId: string;
    programSlug: string;
    periodSlug: string;
}) {
    const groups = await getClassGroupsByPeriodId(periodId);

    if (groups.length === 0) {
        return (
            <EmptyClassGroupsList
                programSlug={programSlug}
                periodSlug={periodSlug}
            />
        );
    }

    type ClassGroupRow = (typeof groups)[number];
    const byDegreeId = new Map<string, ClassGroupRow[]>();
    for (const group of groups) {
        const list = byDegreeId.get(group.degreeId) ?? [];
        list.push(group);
        byDegreeId.set(group.degreeId, list);
    }

    const sections = Array.from(byDegreeId.entries())
        .map(([degreeId, degreeGroups]) => ({
            degreeId,
            degree: degreeGroups[0]!.degree,
            degreeGroups: [...degreeGroups].sort((a, b) => a.name.localeCompare(b.name)),
        }))
        .sort((a, b) => a.degree.name.localeCompare(b.degree.name));

    return (
        <div className="space-y-12">
            {sections.map(({ degreeId, degree, degreeGroups }) => (
                <div key={degreeId} className="space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2 px-2">
                        <span className="w-2 h-6 bg-primary rounded-full" />
                        <div className="flex flex-col min-w-0">
                            <span className="truncate">{degree.name}</span>
                            <span className="text-xs font-mono font-normal text-muted-foreground uppercase tracking-wide">
                                {degree.slug}
                            </span>
                        </div>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {degreeGroups.map((group) => (
                            <div
                                key={group.id}
                                className="border border-surface-border rounded-4xl relative top-0 bg-surface p-6 flex flex-col gap-4 hover:border-primary/30 overflow-hidden transition-all group/card"
                            >
                                {/* Header */}
                                <div className="flex items-center gap-3 w-full z-20">
                                    <div className="flex flex-1 flex-col items-start justify-center px-3 py-1 min-w-0">
                                        <h3 className="font-bold text-2xl">{group.name}</h3>
                                        <p className="text-[10px] text-muted-foreground uppercase">
                                            {group.slug}
                                        </p>
                                    </div>
                                </div>

                                {/* Informações */}
                                <div className="flex flex-row gap-2 flex-wrap z-20">
                                    <div className="flex flex-row gap-1 items-center border border-surface-border rounded-full px-2 py-1 whitespace-nowrap">
                                        <IconBook className="size-4" />
                                        <span className="font-medium text-xs">{group.basePeriod}ª Série / {group.basePeriod}º Ano</span>
                                    </div>
                                    <div className="flex flex-row gap-1 items-center border border-surface-border rounded-full px-2 py-1 whitespace-nowrap">
                                        <IconClock className="size-4" />
                                        <span className="font-medium text-xs">
                                            {shiftLabels[group.shift as keyof typeof shiftLabels]}
                                        </span>
                                    </div>
                                    <div className="flex flex-row gap-1 items-center border border-surface-border rounded-full px-2 py-1 whitespace-nowrap">
                                        <IconBook className="size-4" />
                                        <span className="font-medium text-xs">
                                            {group._count.courses} disciplina{group._count.courses !== 1 ? "s" : ""}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center justify-between mt-auto pt-3 border-t border-surface-border z-20">
                                    <Link
                                        href={`/admin/${programSlug}/periodos/${periodSlug}/turmas/${group.slug}/editar`}
                                        className="p-2 inline-flex rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-muted-foreground transition-colors shrink-0"
                                        title="Editar turma"
                                    >
                                        <IconEdit className="size-4" />
                                    </Link>

                                    <Separator orientation="vertical" className="h-4 bg-surface-border" />

                                    <Link
                                        href={`/admin/${programSlug}/periodos/${periodSlug}/turmas/${group.slug}/disciplinas`}
                                        className="text-primary hover:text-primary/80 text-xs font-bold flex items-center gap-1 transition-colors px-2 py-1 rounded-lg hover:bg-primary/5"
                                    >
                                        <span>Ver Disciplinas</span>
                                        <IconChevronRight className="size-3.5" />
                                    </Link>
                                </div>
                                <div className="absolute -top-10 -right-10 size-36 blur-3xl bg-red-400 dark:bg-green-900 opacity-35 rounded-full" />
                            </div>

                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function ListClassGroups({
    periodId,
    programSlug,
    periodSlug,
}: {
    periodId: string;
    programSlug: string;
    periodSlug: string;
}) {
    return (
        <Suspense fallback={<ListClassGroupsSkeleton />}>
            <ListClassGroupsContent
                periodId={periodId}
                programSlug={programSlug}
                periodSlug={periodSlug}
            />
        </Suspense>
    );
}
