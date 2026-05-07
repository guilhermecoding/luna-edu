"use client";

import { cn } from "@/lib/utils";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

interface GibbyAnimateProps {
    className?: string;
}

export default function GibbyAnimate({ className }: GibbyAnimateProps) {
    return (
        <div className={cn("inline-flex shrink-0", className)}>
            <DotLottieReact
                src="/gibby-animate.lottie"
                loop
                autoplay
                className="block size-full"
            />
        </div>
    );
}
