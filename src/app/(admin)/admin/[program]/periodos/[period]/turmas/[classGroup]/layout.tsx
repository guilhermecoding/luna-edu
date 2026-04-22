import PageSkeleton from "@/components/skeletons/page-skeleton";
import { getClassGroupByPeriodIdAndSlug } from "@/services/class-groups/class-groups.service";
import { getPeriodByProgramAndSlug } from "@/services/periods/periods.service";
import { notFound } from "next/navigation";
import { Suspense } from "react";

async function ClassGroupLayoutContent({
    children,
    params,
}: Readonly<{
    children: React.ReactNode;
    params: Promise<{ program: string; period: string; classGroup: string }>;
}>) {
    const { program: programSlug, period: periodSlug, classGroup: classGroupSlug } = await params;

    const period = await getPeriodByProgramAndSlug(programSlug, periodSlug);

    if (!period) {
        return notFound();
    }

    const classGroup = await getClassGroupByPeriodIdAndSlug(period.id, classGroupSlug);

    if (!classGroup) {
        return notFound();
    }

    return <>{children}</>;
}

export default function ClassGroupLayout({
    children,
    params,
}: Readonly<{
    children: React.ReactNode;
    params: Promise<{ program: string; period: string; classGroup: string }>;
}>) {
    return (
        <Suspense fallback={<PageSkeleton />}>
            <ClassGroupLayoutContent params={params}>
                {children}
            </ClassGroupLayoutContent>
        </Suspense>
    );
}
