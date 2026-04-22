import { getClassGroupsByPeriodId } from "@/services/class-groups/class-groups.service";
import { IconUsersGroup, IconEdit, IconChevronRight, IconSun, IconSunset2, IconMoon, IconBlocks, IconBook, IconClock } from "@tabler/icons-react";
import Link from "next/link";
import { Suspense } from "react";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Shift } from "@/generated/prisma/enums";

function shiftLabel(shift: Shift) {
    switch (shift) {
        case Shift.MORNING: return "Manhã";
        case Shift.AFTERNOON: return "Tarde";
        case Shift.EVENING: return "Noite";
    }
}

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

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((group) => (
                <div
                    key={group.id}
                    className="border border-surface-border rounded-2xl bg-surface p-6 flex flex-col gap-4 hover:border-primary/30 transition-all group/card"
                >
                    {/* Header */}
                    <div className="flex items-center gap-3 bg-background/80 rounded-3xl w-full">
                        <div className="flex flex-1 flex-col items-center justify-center px-2 py-6 min-w-0">
                            <h3 className="font-bold text-3xl truncate">{group.name}</h3>
                            <p className="text-[10px] text-muted-foreground font-mono uppercase">
                                {group.slug}
                            </p>
                        </div>
                    </div>

                    {/* Informações */}
                    <div className="space-y-2 text-xs">
                        <div className="flex flex-col justify-center">
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                <IconBlocks className="size-4" />
                                <span className="text-sm">Matriz</span>
                            </div>
                            <span className="font-medium text-lg truncate">{group.degree.name}</span>
                        </div>
                        <div className="flex flex-col justify-center">
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                <IconBook className="size-4" />
                                <span className="text-sm">Série</span>
                            </div>
                            <span className="font-medium text-lg">{group.basePeriod}ª Série / {group.basePeriod}º Ano</span>
                        </div>
                        <div className="flex flex-col justify-center">
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                <IconClock className="size-4" />
                                <span className="text-sm">Turno</span>
                            </div>
                            <span className="text-lg font-medium">
                                {shiftLabel(group.shift)}
                            </span>
                        </div>
                        <div className="flex flex-col justify-center">
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                <IconBook className="size-4" />
                                <span className="text-sm">Disciplinas</span>
                            </div>
                            <span className="text-lg font-medium">
                                {group._count.courses} disciplina{group._count.courses !== 1 ? "s" : ""}
                            </span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-surface-border">
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
