import { Period } from "@/generated/prisma/client";

export type PeriodListItem = Pick<
    Period,
    "id" | "name" | "slug" | "startDate" | "endDate" | "completedAt"
> & {
    _count: {
        courses: number;
    };
};