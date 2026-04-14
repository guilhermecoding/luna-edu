import { cn } from "@/lib/utils";

interface PulsingStatusIndicatorProps {
    variant?: "success" | "error" | "warning";
    className?: string;
    size?: number;
}

export default function PulsingStatusIndicator({
    variant = "success",
    className,
    size = 3,
}: PulsingStatusIndicatorProps) {
    return (
        <div className={cn("flex flex-row items-center gap-2 text-base", className)}>
            <div className="relative flex items-center justify-center">
                <span className={cn("absolute inline-flex rounded-full opacity-75 animate-ping", {
                    "bg-green-400": variant === "success",
                    "bg-red-400": variant === "error",
                    "bg-yellow-400": variant === "warning",
                }, `w-${size} h-${size}`,
                )}></span>
                <span className={cn("relative inline-flex rounded-full", {
                    "bg-green-500": variant === "success",
                    "bg-red-500": variant === "error",
                    "bg-yellow-500": variant === "warning",
                }, `w-${size} h-${size}`,
                )}></span>
            </div>
            <span className={cn({
                "text-green-500": variant === "success",
                "text-red-500": variant === "error",
                "text-yellow-500": variant === "warning",
            })}>
                Ativo
            </span>
        </div>
    );
}
