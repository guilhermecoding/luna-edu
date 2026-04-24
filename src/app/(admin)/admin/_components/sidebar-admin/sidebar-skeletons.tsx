import { Skeleton } from "@/components/ui/skeleton";

export function SidebarHeaderAdminSkeleton() {
    return (
        <div className="flex justify-center mt-2">
            <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-9 rounded-full bg-gray-400" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-36 bg-gray-400" />
                    <Skeleton className="h-2 w-36 bg-gray-400" />
                </div>
            </div>
        </div>
    );
}