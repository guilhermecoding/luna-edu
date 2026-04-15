import type { PeriodListItem } from "@/services/periods/periods.service";
import ItemPeriod from "./item-period";
import formatDate from "@/lib/format-date";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { IconInfoSquareRounded } from "@tabler/icons-react";

function SkeletonItem() {
    return (
        <div className="w-full min-w-0 flex flex-row items-center bg-surface p-4 rounded-4xl gap-3">
            <div className="mb-4 flex min-w-0 flex-1 flex-col sm:mb-0">
                <div className="flex w-full min-w-0 flex-row items-center justify-between gap-3">
                    <div className="flex w-full flex-row items-center">
                        <Skeleton className="size-14 bg-muted-foreground/20 shrink-0 rounded-xl" />

                        <div className="ml-4 min-w-0 flex-1 space-y-2">
                            <Skeleton className="h-6 w-56 bg-muted-foreground/20 max-w-full" />
                            <Skeleton className="h-4 w-44 bg-muted-foreground/20 max-w-full" />
                        </div>
                    </div>

                    <Skeleton className="hidden sm:flex h-8 w-24 bg-muted-foreground/20 rounded-full" />
                </div>
            </div>

            <Skeleton className="size-8 rounded-full bg-muted-foreground/20" />
        </div>
    );
}

function ListOthersPeriodsSkeleton() {
    return (
        <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
                <SkeletonItem key={index} />
            ))}
        </div>
    );
}

function EmptyGeneralPeriodsList() {
    return (
        <div>
            <p className="text-muted-foreground flex gap-1">
                <IconInfoSquareRounded className="size-4 mt-1 shrink-0" /> Há apenas um período cadastrado, possivelmente o período atual. Para visualizar outros períodos, adicione um período futuro, finalize o período atual ou aguarde ele ser finalizado automaticamente.
            </p>
        </div>
    );
}

function EmptyOthersPeriodsList() {
    return (
        <div>
            <p className="text-muted-foreground">
                Nenhum período encontrado.
            </p>
        </div>
    );
}

async function ListOthersPeriodsContent({
    periodsPromise,
    programSlug,
}: {
    periodsPromise: Promise<PeriodListItem[]>;
    programSlug: string;
}) {
    const periods = await periodsPromise;
    const today = new Date();

    if (periods.length === 0) {
        return <EmptyOthersPeriodsList />;
    }

    const currentId =
        periods.find((p) => p.startDate <= today && p.endDate >= today)?.id ?? periods[0]?.id;

    const others = periods.filter((p) => p.id !== currentId);

    if (others.length === 0) {
        return <EmptyGeneralPeriodsList />;
    }

    return (
        <div className="space-y-4">
            {others.map((period) => (
                <ItemPeriod
                    key={period.id}
                    programSlug={programSlug}
                    periodSlug={period.slug}
                    title={period.name}
                    dateRange={`${formatDate(period.startDate)} - ${formatDate(period.endDate)}`}
                    statusLabel={period.completedAt ? "FINALIZADO" : "ATIVO"}
                    statusVariant={period.completedAt ? "done" : "success"}
                />
            ))}
        </div>
    );
}

export default function ListOthersPeriods({
    periods,
    programSlug,
}: {
    periods: Promise<PeriodListItem[]>;
    programSlug: string;
}) {

    return (
        <div>
            <h1 className="font-bold text-2xl mb-6">Histórico de Períodos</h1>
            <Suspense fallback={<ListOthersPeriodsSkeleton />}>
                <ListOthersPeriodsContent periodsPromise={periods} programSlug={programSlug} />
            </Suspense>
        </div>
    );
}
