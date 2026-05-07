import Page from "@/components/page";
import Section from "@/components/section";
import { Skeleton } from "@/components/ui/skeleton";

export default function EtapasLoading() {
    return (
        <Page>
            <Section>
                <div className="flex flex-row items-center gap-1 mb-3">
                    <Skeleton className="size-4" />
                    <Skeleton className="h-4 w-32" />
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
                <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="border border-surface-border rounded-2xl bg-surface p-6 flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="size-10 rounded-xl" />
                                    <div className="space-y-2">
                                        <Skeleton className="h-5 w-32" />
                                        <Skeleton className="h-3 w-48" />
                                    </div>
                                </div>
                                <Skeleton className="h-8 w-24 rounded-lg" />
                            </div>
                        </div>
                    ))}
                </div>
            </Section>
        </Page>
    );
}
