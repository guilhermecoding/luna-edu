import { getSubPeriodsByPeriodId } from "@/services/sub-periods/sub-periods.service";
import { IconCalendarEvent, IconEdit, IconLock, IconLockOpen } from "@tabler/icons-react";
import Link from "next/link";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

function ListSubPeriodsSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="border border-surface-border rounded-2xl bg-surface p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Skeleton className="size-10 rounded-xl bg-muted-foreground/10" />
                        <div className="space-y-2">
                            <Skeleton className="h-5 w-28 bg-muted-foreground/10" />
                            <Skeleton className="h-3 w-20 bg-muted-foreground/10" />
                        </div>
                    </div>
                    <Skeleton className="h-4 w-full bg-muted-foreground/10" />
                </div>
            ))}
        </div>
    );
}

function EmptySubPeriodsList({ programSlug, periodSlug }: { programSlug: string; periodSlug: string }) {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-surface-border rounded-4xl">
            <IconCalendarEvent className="size-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-semibold">Nenhuma etapa avaliativa</h3>
            <p className="text-muted-foreground mt-2 max-w-sm mb-6">
                Etapas avaliativas dividem o período letivo em bimestres ou trimestres para controle de notas e fechamentos parciais.
            </p>
            <Link
                href={`/admin/${programSlug}/periodos/${periodSlug}/etapas/novo`}
                className="text-primary hover:underline text-sm font-medium"
            >
                + Criar a primeira etapa
            </Link>
        </div>
    );
}

async function ListSubPeriodsContent({
    periodId,
    programSlug,
    periodSlug,
}: {
    periodId: string;
    programSlug: string;
    periodSlug: string;
}) {
    const subPeriods = await getSubPeriodsByPeriodId(periodId);

    if (subPeriods.length === 0) {
        return <EmptySubPeriodsList programSlug={programSlug} periodSlug={periodSlug} />;
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {subPeriods.map((sp) => {
                const isClosed = !!sp.closedAt;
                return (
                    <div
                        key={sp.id}
                        className={`border rounded-2xl bg-surface p-6 flex flex-col gap-4 transition-all ${
                            isClosed
                                ? "border-red-200 dark:border-red-800 opacity-75"
                                : "border-surface-border hover:border-primary/30"
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`flex justify-center items-center size-10 rounded-xl shrink-0 ${
                                isClosed
                                    ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                                    : "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                            }`}>
                                <IconCalendarEvent className="size-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-sm truncate">{sp.name}</h3>
                                <p className="text-[10px] text-muted-foreground font-mono uppercase">{sp.slug}</p>
                            </div>
                            <div className="flex items-center gap-1">
                                {isClosed ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-[10px] font-semibold">
                                        <IconLock className="size-3" />
                                        Fechado
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-semibold">
                                        <IconLockOpen className="size-3" />
                                        Aberto
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="text-xs text-muted-foreground space-y-1">
                            <p>
                                <span className="font-medium">Período:</span>{" "}
                                {new Date(sp.startDate).toLocaleDateString("pt-BR")} — {new Date(sp.endDate).toLocaleDateString("pt-BR")}
                            </p>
                            <p>
                                <span className="font-medium">Ordem:</span> {sp.order}º  ·  <span className="font-medium">Peso:</span> {sp.weight}
                            </p>
                        </div>

                        <div className="flex justify-end mt-auto">
                            <Link
                                href={`/admin/${programSlug}/periodos/${periodSlug}/etapas/${sp.slug}/editar`}
                                className="text-primary hover:text-primary/80 text-xs font-bold flex items-center gap-1 transition-colors px-2 py-1 rounded-lg hover:bg-primary/5"
                            >
                                <IconEdit className="size-3.5" />
                                Editar
                            </Link>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default function ListSubPeriods({
    periodId,
    programSlug,
    periodSlug,
}: {
    periodId: string;
    programSlug: string;
    periodSlug: string;
}) {
    return (
        <Suspense fallback={<ListSubPeriodsSkeleton />}>
            <ListSubPeriodsContent periodId={periodId} programSlug={programSlug} periodSlug={periodSlug} />
        </Suspense>
    );
}
