import { PeriodListItem } from "@/services/periods/periods.type";
import getDayKeyInTimeZone, { APP_TIMEZONE } from "@/lib/get-day-key-in-time-zone";

export function isPeriodActiveByDay(
    period: PeriodListItem,
    referenceDate: Date,
    dbTimeZone = "UTC",
    referenceTimeZone = APP_TIMEZONE,
) {
    const referenceDay = getDayKeyInTimeZone(referenceDate, referenceTimeZone);
    const startDay = getDayKeyInTimeZone(period.startDate, dbTimeZone);
    const endDay = getDayKeyInTimeZone(period.endDate, dbTimeZone);

    return referenceDay >= startDay && referenceDay <= endDay;
}

export default function getPeriodStatus(
    period: PeriodListItem,
    today: Date,
    dbTimeZone = "UTC",
    referenceTimeZone = APP_TIMEZONE,
) {
    if (period.completedAt) {
        return {
            statusLabel: "FINALIZADO",
            statusVariant: "done" as const,
        };
    }

    const todayDay = getDayKeyInTimeZone(today, referenceTimeZone);
    const startDay = getDayKeyInTimeZone(period.startDate, dbTimeZone);
    const endDay = getDayKeyInTimeZone(period.endDate, dbTimeZone);

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