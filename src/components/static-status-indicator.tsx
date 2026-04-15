import { cn } from "@/lib/utils";

type Variant = "success" | "warning" | "error" | "done" | "info";

interface InfoProps {
    text: string;
    variant?: Variant;
    size?: number;
    className?: string;
}

export default function StaticStatusIndicator({
    text,
    variant = "done",
    size = 2.5,
    className,
}: InfoProps,
) {
    return (
        <div className={cn("flex flex-row gap-2 items-center", className)}>
            <div className={cn("rounded-full", {
                "bg-green-500": variant === "success",
                "bg-yellow-500": variant === "warning",
                "bg-red-500": variant === "error",
                "bg-blue-500": variant === "info",
                "bg-muted-foreground/70": variant === "done",
            }, `size-${size}`)}></div>
            <span className={cn("font-bold text-sm", {
                "text-green-500": variant === "success",
                "text-yellow-500": variant === "warning",
                "text-red-500": variant === "error",
                "text-blue-500": variant === "info",
                "text-muted-foreground/70": variant === "done",
            })}>
                {text}
            </span>
        </div>
    );
}
