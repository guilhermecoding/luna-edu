import { getProgramBySlug } from "@/services/programs/programs.service";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import PageSkeleton from "@/components/skeletons/page-skeleton";

async function ProgramLayoutContent({
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

export default function ProgramLayout({
    children,
    params,
}: Readonly<{
    children: React.ReactNode;
    params: Promise<{ program: string }>
}>) {
    return (
        <Suspense fallback={<PageSkeleton />}>
            <ProgramLayoutContent params={params}>
                {children}
            </ProgramLayoutContent>
        </Suspense>
    );
}
