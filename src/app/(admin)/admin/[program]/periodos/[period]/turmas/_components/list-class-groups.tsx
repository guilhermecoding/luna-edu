import { Skeleton } from "@/components/ui/skeleton";
import { hashString } from "@/lib/avatar-utils";
import { getClassGroupsByPeriodId } from "@/services/class-groups/class-groups.service";
import { IconBook, IconChevronRight, IconClock, IconCodeAsterisk, IconSchool, IconUser, IconUsersGroup } from "@tabler/icons-react";
import Link from "next/link";
import { Suspense } from "react";
import { shiftLabels } from "../schema";

const CLASS_GROUP_ACCENTS = [
    {
        border: "border-l-red-400 dark:border-l-red-900",
        blur: "bg-red-400 dark:bg-red-900",
    },
    {
        border: "border-l-blue-400 dark:border-l-blue-900",
        blur: "bg-blue-400 dark:bg-blue-900",
    },
    {
        border: "border-l-emerald-400 dark:border-l-emerald-900",
        blur: "bg-emerald-400 dark:bg-emerald-900",
    },
    {
        border: "border-l-violet-400 dark:border-l-violet-900",
        blur: "bg-violet-400 dark:bg-violet-900",
    },
    {
        border: "border-l-amber-400 dark:border-l-amber-900",
        blur: "bg-amber-400 dark:bg-amber-900",
    },
    {
        border: "border-l-cyan-400 dark:border-l-cyan-900",
        blur: "bg-cyan-400 dark:bg-cyan-900",
    },
];

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
    teacherId,
}: {
    periodId: string;
    programSlug: string;
    periodSlug: string;
    teacherId?: string;
}) {
    const groups = await getClassGroupsByPeriodId(periodId, teacherId);

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
                        <span className="w-2 h-9 bg-primary rounded-full" />
                        <div className="flex flex-col min-w-0">
                            <span className="truncate">{degree.name}</span>
                            <span className="text-xs font-mono flex flex-row gap-1 items-center font-normal text-muted-foreground uppercase tracking-wide">
                                <IconCodeAsterisk className="size-4" /> {degree.slug}
                            </span>
                        </div>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {degreeGroups.map((group) => {
                            const accent = CLASS_GROUP_ACCENTS[hashString(group.name) % CLASS_GROUP_ACCENTS.length];

                            return (
                                <div
                                    key={group.id}
                                    className={`border border-surface-border border-l-4 ${accent.border} rounded-4xl relative top-0 bg-surface p-6 flex flex-col gap-4 hover:border-primary/30 overflow-hidden transition-all group/card`}
                                >
                                    {/* Header */}
                                    <div className="flex items-center gap-3 w-full z-20">
                                        <div className="flex flex-1 flex-col items-start justify-center px-3 py-1 min-w-0">
                                            <h3 className="font-bold text-2xl">{group.name}</h3>
                                            <p className="text-xs flex flex-row gap-1 items-center font-semibold font-mono text-muted-foreground uppercase">
                                                <IconCodeAsterisk className="size-4" /> {group.slug}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Informações */}
                                    <div className="flex flex-row gap-2 flex-wrap z-20">
                                        <div className="flex flex-row gap-1 items-center border border-surface-border rounded-full px-2 py-1 whitespace-nowrap">
                                            <IconSchool className="size-4" />
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
                                        <div className="flex flex-row gap-1 items-center border border-surface-border rounded-full px-2 py-1 whitespace-nowrap">
                                            <IconUser className="size-4" />
                                            <span className="font-medium text-xs">
                                                {group._count.students} aluno{group._count.students !== 1 ? "s" : ""}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="mt-auto pt-3 border-t border-surface-border z-20">
                                        <Link
                                            href={`/admin/${programSlug}/periodos/${periodSlug}/turmas/${group.slug}`}
                                            className="text-primary hover:text-primary/80 text-sm font-bold flex flex-row justify-center items-center gap-1 transition-colors px-2 py-1 rounded-lg hover:bg-primary/5"
                                        >
                                            <span>Expandir Turma</span>
                                            <IconChevronRight className="size-4.5" />
                                        </Link>
                                    </div>
                                    <div className={`absolute -top-10 -right-10 size-42 blur-3xl opacity-15 rounded-full ${accent.blur}`} />
                                </div>
                            );

                        })}
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
    teacherId,
}: {
    periodId: string;
    programSlug: string;
    periodSlug: string;
    teacherId?: string;
}) {
    return (
        <Suspense fallback={<ListClassGroupsSkeleton />}>
            <ListClassGroupsContent
                periodId={periodId}
                programSlug={programSlug}
                periodSlug={periodSlug}
                teacherId={teacherId}
            />
        </Suspense>
    );
}
