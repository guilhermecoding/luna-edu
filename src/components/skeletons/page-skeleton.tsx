import { Skeleton } from "../ui/skeleton";

export default function PageSkeleton() {
    return (
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
    );
}
