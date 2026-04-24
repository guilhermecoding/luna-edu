import Page from "@/components/page";
import Section from "@/components/section";
import { Skeleton } from "@/components/ui/skeleton";

export default function TurmasLoading() {
    return (
        <Page>
            <Section>
                <div className="flex flex-row items-center gap-1 mb-3">
                    <Skeleton className="size-4" />
                    <Skeleton className="h-4 w-20" />
                </div>
                <div className="flex flex-col lg:flex-row gap-y-6">
                    <div className="flex-1">
                        <Skeleton className="h-10 w-64 mb-2" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                    <div className="flex flex-1 justify-end items-end">
                        <Skeleton className="h-10 w-full sm:w-40 rounded-lg" />
                    </div>
                </div>
            </Section>

            <Section className="mt-18">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="border border-surface-border rounded-2xl bg-surface p-6 flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                                <Skeleton className="size-10 rounded-xl" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-5 w-28" />
                                    <Skeleton className="h-3 w-20" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-2/3" />
                            </div>
                            <div className="flex items-center justify-between mt-auto pt-3 border-t">
                                <Skeleton className="size-8" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                        </div>
                    ))}
                </div>
            </Section>
        </Page>
    );
}
