import { PeriodListItem } from "@/services/periods/periods.type";
import getDayKeyInTimeZone from "@/lib/get-day-key-in-time-zone";

export function isPeriodActiveByDay(
    period: PeriodListItem,
    referenceDate: Date,
    timeZone = "UTC",
) {
    const referenceDay = getDayKeyInTimeZone(referenceDate, timeZone);
    const startDay = getDayKeyInTimeZone(period.startDate, timeZone);
    const endDay = getDayKeyInTimeZone(period.endDate, timeZone);

    return referenceDay >= startDay && referenceDay <= endDay;
}

export default function getPeriodStatus(
    period: PeriodListItem,
    today: Date,
    timeZone = "UTC",
) {
    if (period.completedAt) {
        return {
            statusLabel: "FINALIZADO",
            statusVariant: "done" as const,
        };
    }

    const todayDay = getDayKeyInTimeZone(today, timeZone);
    const startDay = getDayKeyInTimeZone(period.startDate, timeZone);
    const endDay = getDayKeyInTimeZone(period.endDate, timeZone);

    if (todayDay < startDay) {
        return {
            statusLabel: "PRÓXIMO",
            statusVariant: "info" as const,
        };
    }

    if (todayDay > endDay) {
        return {
            statusLabel: "PENDENTE",
            statusVariant: "warning" as const,
        };
    }

    return {
        statusLabel: "ATIVO",
        statusVariant: "success" as const,
    };
}