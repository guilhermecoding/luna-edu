"use client";

import { cn } from "@/lib/utils";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

interface GibbyAnimateProps {
    className?: string;
}

export default function GibbyAnimate({ className }: GibbyAnimateProps) {
    return (
        <DotLottieReact
            src="/gibby-animate.lottie"
            loop
            autoplay
            className={cn("w-full h-full", className)}
        />
    );
}
