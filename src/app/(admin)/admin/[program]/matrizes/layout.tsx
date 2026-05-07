import { getProgramBySlug } from "@/services/programs/programs.service";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import PageSkeleton from "@/components/skeletons/page-skeleton";

async function MatrizesLayoutContent({
    children,
    params,
}: Readonly<{
    children: React.ReactNode
    params: Promise<{ program: string }>
}>) {
    const { program: programSlug } = await params;

    const program = await getProgramBySlug(programSlug);

    if (!program) {
        return notFound();
    }

    return (
        <>
            {children}
        </>
    );
}

export default function MatrizesLayout({
    children,
    params,
}: Readonly<{
    children: React.ReactNode;
    params: Promise<{ program: string }>
}>) {
    return (
        <Suspense fallback={<PageSkeleton />}>
            <MatrizesLayoutContent params={params}>
                {children}
            </MatrizesLayoutContent>
        </Suspense>
    );
}
