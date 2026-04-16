import { getDegreeBySlug } from "@/services/degrees/degrees.service";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import SidebarAndPageSkeleton from "@/components/skeletons/sidebar-and-page-skeleton";

async function DegreeLayoutContent({
    children,
    params,
}: Readonly<{
    children: React.ReactNode;
    params: Promise<{ program: string; degree: string }>;
}>) {
    const { program: programSlug, degree: degreeSlug } = await params;

    const degree = await getDegreeBySlug(programSlug, degreeSlug);

    if (!degree) {
        return notFound();
    }

    return (
        <>
            {children}
        </>
    );
}

export default function DegreeLayout({
    children,
    params,
}: Readonly<{
    children: React.ReactNode;
    params: Promise<{ program: string; degree: string }>;
}>) {
    return (
        <Suspense fallback={<SidebarAndPageSkeleton />}>
            <DegreeLayoutContent params={params}>
                {children}
            </DegreeLayoutContent>
        </Suspense>
    );
}
