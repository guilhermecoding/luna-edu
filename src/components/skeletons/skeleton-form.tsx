
import { Skeleton } from "@/components/ui/skeleton";

export default function SkeletonForm() {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Skeleton className="h-5 w-44 rounded-md" />
                <Skeleton className="h-14 w-full rounded-lg" />
            </div>

            <div className="space-y-2">
                <Skeleton className="h-5 w-16 rounded-md" />
                <Skeleton className="h-14 w-full rounded-lg bg-muted/70" />
                <Skeleton className="h-4 w-56 rounded-md" />
            </div>

            <div className="space-y-2">
                <Skeleton className="h-5 w-24 rounded-md" />
                <Skeleton className="h-32 w-full rounded-lg" />
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <Skeleton className="h-11 w-28 rounded-full" />
                <Skeleton className="h-11 w-40 rounded-full" />
            </div>
        </div>
    );
}
