"use client";

import { useEffect, useState } from "react";
import Image, { type StaticImageData } from "next/image";

type RandomLoginThumbProps = {
    thumbs: StaticImageData[];
};

export default function RandomLoginThumb({ thumbs }: RandomLoginThumbProps) {
    const [thumb, setThumb] = useState<StaticImageData | null>(null);

    useEffect(() => {
        const raf = requestAnimationFrame(() => {
            const randomIndex = Math.floor(Math.random() * thumbs.length);
            setThumb(thumbs[randomIndex]);
        });

        return () => cancelAnimationFrame(raf);
    }, [thumbs]);

    if (!thumb) {
        return <div className="absolute inset-0 bg-surface" />;
    }

    return <Image src={thumb} alt="Background" fill className="object-cover" priority />;
}
