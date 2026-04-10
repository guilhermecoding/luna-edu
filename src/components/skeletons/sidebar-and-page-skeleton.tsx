
import { Skeleton } from "@/components/ui/skeleton";

export default function SidebarAndPageSkeleton() {
    return (
        <div className="flex min-h-svh w-full">
            <aside className="hidden w-64 shrink-0 border-r p-4 md:flex">
                <div className="flex w-full flex-col gap-4">
                    <Skeleton className="h-14 w-full rounded-2xl" />

                    <div className="space-y-2 pt-2">
                        {Array.from({ length: 7 }).map((_, index) => (
                            <Skeleton key={index} className="h-8 w-full rounded-md" />
                        ))}
                    </div>

                    <div className="mt-auto space-y-2">
                        <Skeleton className="h-10 w-full rounded-xl" />
                        <Skeleton className="h-10 w-full rounded-xl" />
                    </div>
                </div>
            </aside>

            <div className="flex min-w-0 flex-1 flex-col">
                <header className="flex h-16 items-center gap-3 border-b px-4 md:px-6">
                    <Skeleton className="size-8 rounded-md md:hidden" />
                    <Skeleton className="h-5 w-44" />
                </header>

                <main className="space-y-6 p-4 md:p-6">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <Skeleton key={index} className="h-28 w-full rounded-2xl" />
                        ))}
                    </div>

                    <Skeleton className="h-9 w-52" />

                    <div className="space-y-3">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <Skeleton key={index} className="h-16 w-full rounded-xl" />
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
}
