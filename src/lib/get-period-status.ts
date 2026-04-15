import { PeriodListItem } from "@/services/periods/periods.type";

export default function getPeriodStatus(period: PeriodListItem, today: Date) {
    if (period.completedAt) {
        return {
            statusLabel: "FINALIZADO",
            statusVariant: "done" as const,
        };
    }

    if (period.startDate > today) {
        return {
            statusLabel: "PRÓXIMO",
            statusVariant: "info" as const,
        };
    }

    if (period.endDate < today) {
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