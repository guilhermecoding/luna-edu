import type { PeriodListItem } from "@/services/periods/periods.service";
import ItemPeriod from "./item-period";
import formatDate from "@/lib/format-date";

export default async function ListOthersPeriods({
    periodsPromise,
    programSlug,
}: {
    periodsPromise: Promise<PeriodListItem[]>;
    programSlug: string;
}) {
    const periods = await periodsPromise;
    const today = new Date();

    const currentId =
        periods.find((p) => p.startDate <= today && p.endDate >= today)?.id ?? periods[0]?.id;

    const others = periods.filter((p) => p.id !== currentId);

    return (
        <div>
            <h1 className="font-bold text-2xl mb-6">Histórico de Períodos</h1>

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
        </div>
    );
}
