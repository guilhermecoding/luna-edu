"use client";

import { ButtonLink } from "@/components/ui/button-link";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { RefObject, useRef } from "react";

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
    programSlug: string;
    periodSlug: string;
};

export default function ClassGroupsPreview({
    classGroups,
    programSlug,
    periodSlug,
}: ClassGroupsPreviewProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    const handleScroll = (direction: "left" | "right") => {
        const element = scrollRef.current;
        if (!element) return;

        const amount = Math.max(element.clientWidth * 0.8, 280);
        element.scrollBy({
            left: direction === "left" ? -amount : amount,
            behavior: "smooth",
        });
    };

    return (
        <SectionPreviewWrapper
            classGroups={classGroups}
            onScrollLeft={() => handleScroll("left")}
            onScrollRight={() => handleScroll("right")}
            periodSlug={periodSlug}
            programSlug={programSlug}
            scrollRef={scrollRef}
        />
    );
}

function SectionPreviewWrapper({
    classGroups,
    programSlug,
    periodSlug,
    scrollRef,
    onScrollLeft,
    onScrollRight,
}: {
    classGroups: PreviewClassGroup[];
    programSlug: string;
    periodSlug: string;
    scrollRef: RefObject<HTMLDivElement | null>;
    onScrollLeft: () => void;
    onScrollRight: () => void;
}) {
    return (
        <>
            <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                    <h2 className="text-base sm:text-lg font-bold">Prévia das Turmas</h2>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                        Mostrando até 5 turmas deste período.
                    </p>
                </div>
                <ButtonLink
                    href={`/admin/${programSlug}/periodos/${periodSlug}/turmas`}
                    variant="outline"
                    className="text-xs shrink-0"
                >
                    Mostrar todas
                </ButtonLink>
            </div>

            {classGroups.length === 0 ? (
                <div className="flex items-center justify-center p-8 text-sm text-muted-foreground border-2 border-dashed border-surface-border rounded-3xl">
                    Nenhuma turma cadastrada neste período.
                </div>
            ) : (
                <div className="relative">
                    <button
                        type="button"
                        aria-label="Rolar turmas para a esquerda"
                        onClick={onScrollLeft}
                        className="absolute left-2 top-1/2 -translate-y-1/2 z-20 inline-flex size-9 items-center justify-center rounded-full border border-surface-border bg-background/85 backdrop-blur-sm transition hover:bg-background"
                    >
                        <IconChevronLeft className="size-5" />
                    </button>

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
                        className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden px-12"
                    >
                        <div className="flex gap-4 pb-1">
                            {classGroups.map((group) => (
                                <div
                                    key={group.id}
                                    className="min-w-64 sm:min-w-72 rounded-3xl border border-surface-border bg-surface p-4 flex flex-col gap-3"
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
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
