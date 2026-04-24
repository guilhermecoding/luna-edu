"use client";

import { IconCalendarEventFilled, IconCaretRight, IconChevronLeft, IconChevronRight, IconCodeAsterisk, IconLock, IconLockOpen } from "@tabler/icons-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type PreviewSubPeriod = {
    id: string;
    name: string;
    slug: string;
    startDate: Date;
    endDate: Date;
    closedAt: Date | null;
};

type SubPeriodsPreviewProps = {
    subPeriods: PreviewSubPeriod[];
    totalSubPeriods: number;
    programSlug: string;
    periodSlug: string;
};

export default function SubPeriodsPreview({
    subPeriods,
    totalSubPeriods,
    programSlug,
    periodSlug,
}: SubPeriodsPreviewProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);

    const handleScroll = (direction: "left" | "right") => {
        const element = scrollRef.current;
        if (!element) return;

        const amount = Math.max(element.clientWidth * 0.8, 280);
        element.scrollBy({
            left: direction === "left" ? -amount : amount,
            behavior: "smooth",
        });
    };

    useEffect(() => {
        const element = scrollRef.current;
        if (!element) return;

        const updateScrollState = () => {
            setCanScrollLeft(element.scrollLeft > 0);
        };

        updateScrollState();
        element.addEventListener("scroll", updateScrollState, { passive: true });

        return () => {
            element.removeEventListener("scroll", updateScrollState);
        };
    }, []);

    return (
        <>
            <div className="flex flex-nowrap items-center gap-3 mb-4">
                <div className="min-w-0 shrink">
                    <h2 className="text-base sm:text-lg font-bold flex flex-row items-center gap-2">
                        <IconCalendarEventFilled className="size-4" />
                        Etapas Avaliativas
                    </h2>
                </div>
                <div
                    className="h-px min-h-px flex-1 min-w-6 bg-border"
                    role="separator"
                    aria-orientation="horizontal"
                />
                <Link
                    href={`/admin/${programSlug}/periodos/${periodSlug}/etapas`}
                    className="text-xs shrink-0 flex flex-row items-center gap-1 text-primary hover:text-primary/80 transition-colors"
                >
                    Mostrar todas <IconChevronRight className="size-4" />
                </Link>
            </div>

            {subPeriods.length === 0 ? (
                <div className="flex items-center justify-center p-8 text-sm text-muted-foreground border-2 border-dashed border-surface-border rounded-3xl">
                    Nenhuma etapa avaliativa cadastrada neste período.
                </div>
            ) : (
                <div className="relative">
                    {canScrollLeft && (
                        <button
                            type="button"
                            aria-label="Rolar etapas para a esquerda"
                            onClick={() => handleScroll("left")}
                            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 inline-flex size-9 items-center justify-center rounded-full border border-surface-border bg-background/85 backdrop-blur-sm transition hover:bg-background"
                        >
                            <IconChevronLeft className="size-5" />
                        </button>
                    )}

                    <button
                        type="button"
                        aria-label="Rolar etapas para a direita"
                        onClick={() => handleScroll("right")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 z-20 inline-flex size-9 items-center justify-center rounded-full border border-surface-border bg-background/85 backdrop-blur-sm transition hover:bg-background"
                    >
                        <IconChevronRight className="size-5" />
                    </button>

                    <div
                        ref={scrollRef}
                        className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pr-12"
                    >
                        <div className="flex gap-4 pb-1">
                            {subPeriods.map((subPeriod) => {
                                const isClosed = !!subPeriod.closedAt;
                                return (
                                    <Link
                                        href={`/admin/${programSlug}/periodos/${periodSlug}/etapas/${subPeriod.slug}/editar`}
                                        key={subPeriod.id}
                                        className="w-64 sm:w-72 rounded-3xl border border-surface-border bg-surface p-4 flex flex-col gap-3 hover:border-primary/60 hover:bg-surface/50 transition-colors"
                                    >
                                        <div className="min-w-0">
                                            <p className="text-lg font-bold truncate">{subPeriod.name}</p>
                                            <p className="text-xs flex flex-row items-center gap-1 font-mono font-bold uppercase text-muted-foreground truncate">
                                                <IconCodeAsterisk className="size-3.5" /> {subPeriod.slug}
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap gap-2 text-xs">
                                            <span className="px-2 py-1 rounded-full border border-surface-border whitespace-nowrap">
                                                {new Date(subPeriod.startDate).toLocaleDateString("pt-BR")} - {new Date(subPeriod.endDate).toLocaleDateString("pt-BR")}
                                            </span>
                                            <span
                                                className={`px-2 py-1 rounded-full border border-surface-border whitespace-nowrap inline-flex items-center gap-1 ${isClosed
                                                    ? "text-red-600 dark:text-red-400"
                                                    : "text-green-600 dark:text-green-400"
                                                    }`}
                                            >
                                                {isClosed ? <IconLock className="size-3.5" /> : <IconLockOpen className="size-3.5" />}
                                                {isClosed ? "Fechado" : "Aberto"}
                                            </span>
                                        </div>
                                    </Link>
                                );
                            })}

                            {totalSubPeriods > 5 && (
                                <Link
                                    href={`/admin/${programSlug}/periodos/${periodSlug}/etapas`}
                                    className="min-w-64 sm:min-w-72 rounded-3xl border-2 border-dashed border-surface-border bg-surface p-4 flex items-center justify-center text-center text-sm font-semibold text-primary hover:bg-surface/50 transition-colors"
                                >
                                    <span>Mostrar mais etapas</span>
                                    <IconCaretRight className="size-4" />
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
