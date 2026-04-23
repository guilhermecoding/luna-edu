"use client";

import { IconCaretRight, IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { RefObject, useEffect, useRef, useState } from "react";
import Link from "next/link";

type PreviewClassGroup = {
    id: string;
    name: string;
    slug: string;
    basePeriod: number;
    _count: {
        courses: number;
    };
};

type ClassGroupsPreviewProps = {
    classGroups: PreviewClassGroup[];
    totalClassGroups: number;
    programSlug: string;
    periodSlug: string;
};

export default function ClassGroupsPreview({
    classGroups,
    totalClassGroups,
    programSlug,
    periodSlug,
}: ClassGroupsPreviewProps) {
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
        <SectionPreviewWrapper
            canScrollLeft={canScrollLeft}
            classGroups={classGroups}
            onScrollLeft={() => handleScroll("left")}
            onScrollRight={() => handleScroll("right")}
            periodSlug={periodSlug}
            programSlug={programSlug}
            scrollRef={scrollRef}
            showMoreCard={totalClassGroups > 5}
        />
    );
}

function SectionPreviewWrapper({
    canScrollLeft,
    classGroups,
    programSlug,
    periodSlug,
    scrollRef,
    onScrollLeft,
    onScrollRight,
    showMoreCard,
}: {
    canScrollLeft: boolean;
    classGroups: PreviewClassGroup[];
    programSlug: string;
    periodSlug: string;
    scrollRef: RefObject<HTMLDivElement | null>;
    onScrollLeft: () => void;
    onScrollRight: () => void;
    showMoreCard: boolean;
}) {
    return (
        <>
            <div className="flex flex-nowrap items-center gap-3 mb-4">
                <div className="min-w-0 shrink">
                    <h2 className="text-base sm:text-lg font-bold">Turmas</h2>
                </div>
                <div
                    className="h-px min-h-px flex-1 min-w-6 bg-border"
                    role="separator"
                    aria-orientation="horizontal"
                />
                <Link
                    href={`/admin/${programSlug}/periodos/${periodSlug}/turmas`}
                    className="text-xs shrink-0 flex flex-row items-center gap-1 text-primary hover:text-primary/80 transition-colors"
                >
                    Mostrar todas <IconChevronRight className="size-4" />
                </Link>
            </div>

            {classGroups.length === 0 ? (
                <div className="flex items-center justify-center p-8 text-sm text-muted-foreground border-2 border-dashed border-surface-border rounded-3xl">
                    Nenhuma turma cadastrada neste período.
                </div>
            ) : (
                <div className="relative">
                    {canScrollLeft && (
                        <button
                            type="button"
                            aria-label="Rolar turmas para a esquerda"
                            onClick={onScrollLeft}
                            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 inline-flex size-9 items-center justify-center rounded-full border border-surface-border bg-background/85 backdrop-blur-sm transition hover:bg-background"
                        >
                            <IconChevronLeft className="size-5" />
                        </button>
                    )}

                    <button
                        type="button"
                        aria-label="Rolar turmas para a direita"
                        onClick={onScrollRight}
                        className="absolute right-2 top-1/2 -translate-y-1/2 z-20 inline-flex size-9 items-center justify-center rounded-full border border-surface-border bg-background/85 backdrop-blur-sm transition hover:bg-background"
                    >
                        <IconChevronRight className="size-5" />
                    </button>

                    <div
                        ref={scrollRef}
                        className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pr-12"
                    >
                        <div className="flex gap-4 pb-1">
                            {classGroups.map((group) => (
                                <Link
                                    href={`/admin/${programSlug}/periodos/${periodSlug}/turmas/${group.slug}`}
                                    key={group.id}
                                    className="min-w-64 sm:min-w-72 rounded-3xl border border-surface-border bg-surface p-4 flex flex-col gap-3 hover:border-primary/60 hover:bg-surface/50 transition-colors"
                                >
                                    <div className="min-w-0">
                                        <p className="text-lg font-bold truncate">{group.name}</p>
                                        <p className="text-xs font-mono uppercase text-muted-foreground truncate">
                                            {group.slug}
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap gap-2 text-xs">
                                        <span className="px-2 py-1 rounded-full border border-surface-border whitespace-nowrap">
                                            {group.basePeriod}ª Série
                                        </span>
                                        <span className="px-2 py-1 rounded-full border border-surface-border whitespace-nowrap">
                                            {group._count.courses} disciplina{group._count.courses !== 1 ? "s" : ""}
                                        </span>
                                    </div>
                                </Link>
                            ))}

                            {showMoreCard && (
                                <Link
                                    href={`/admin/${programSlug}/periodos/${periodSlug}/turmas`}
                                    className="min-w-64 sm:min-w-72 rounded-3xl border-2 border-dashed border-surface-border bg-surface p-4 flex items-center justify-center text-center text-sm font-semibold text-primary hover:bg-surface/50 transition-colors"
                                >
                                    <span>Mostrar mais turmas</span>
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
