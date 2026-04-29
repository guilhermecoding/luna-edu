"use client";

import { useEffect, useState } from "react";
import Image, { type StaticImageData } from "next/image";

type RandomLoginThumbProps = {
    thumbs: StaticImageData[];
};

export default function RandomLoginThumb({ thumbs }: RandomLoginThumbProps) {
    const [thumb, setThumb] = useState(thumbs[0]);

    useEffect(() => {
        const raf = requestAnimationFrame(() => {
            const randomIndex = Math.floor(Math.random() * thumbs.length);
            setThumb(thumbs[randomIndex]);
        });

        return () => cancelAnimationFrame(raf);
    }, [thumbs]);

    return <Image src={thumb} alt="Background" fill className="object-cover" priority />;
}
