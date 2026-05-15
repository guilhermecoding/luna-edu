import Link from "next/link";
import { IconCalendarEvent, IconClock } from "@tabler/icons-react";
import type { LessonListItem } from "@/services/lessons/lessons.service";

interface UpcomingLesson {
    date: string; // YYYY-MM-DD
    dayOfWeek: string;
    scheduleId: string;
    timeSlotName: string;
    startTime: string;
    endTime: string;
    teacherName: string | null;
}

interface LessonCardListProps {
    lessons: LessonListItem[];
    upcomingLessons: UpcomingLesson[];
    basePath: string;
}

function formatDate(date: Date | string) {
    return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
    }).format(new Date(date));
}

function formatWeekDay(date: Date | string) {
    return new Intl.DateTimeFormat("pt-BR", {
        weekday: "long",
        timeZone: "UTC",
    }).format(new Date(date));
}

type MergedItem =
    | { type: "lesson"; data: LessonListItem }
    | { type: "upcoming"; data: UpcomingLesson };

function mergeAndSort(lessons: LessonListItem[], upcoming: UpcomingLesson[]): MergedItem[] {
    // Mapear datas+timeslots que já foram criadas

    // Filtrar upcoming que não colidem com lessons criadas
    const filteredUpcoming = upcoming.filter((u) => {
        // Buscar por data+timeSlot direto
        return !lessons.some((l) => {
            const ld = new Date(l.date).toISOString().split("T")[0];
            return ld === u.date && l.timeSlotId === u.scheduleId;
        });
    });

    const items: MergedItem[] = [
        ...lessons.map((l) => ({ type: "lesson" as const, data: l })),
        ...filteredUpcoming.map((u) => ({ type: "upcoming" as const, data: u })),
    ];

    items.sort((a, b) => {
        const dateA = a.type === "lesson" ? new Date(a.data.date).getTime() : new Date(a.data.date + "T00:00:00Z").getTime();
        const dateB = b.type === "lesson" ? new Date(b.data.date).getTime() : new Date(b.data.date + "T00:00:00Z").getTime();
        return dateA - dateB;
    });

    return items;
}

export default function LessonCardList({ lessons, upcomingLessons, basePath }: LessonCardListProps) {
    const items = mergeAndSort(lessons, upcomingLessons);

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-surface-border rounded-4xl">
                <IconCalendarEvent className="size-12 text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-lg font-semibold">Nenhuma aula registrada</h3>
                <p className="text-muted-foreground mt-2 max-w-sm">
                    Configure os horários da disciplina ou clique em &quot;Nova Aula&quot; para registrar aulas manualmente.
                </p>
            </div>
        );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const pendingItems = items.filter(item => {
        if (item.type === "upcoming") return true;
        return !item.data.attendanceUpdatedAt;
    });

    const realizedItems = items.filter(item => {
        if (item.type === "lesson") return !!item.data.attendanceUpdatedAt;
        return false;
    });

    const renderItem = (item: MergedItem, index: number) => {
        if (item.type === "lesson") {
            const lesson = item.data;
            const isLate = !lesson.attendanceUpdatedAt && new Date(lesson.date).getTime() < today.getTime();

            const lessonDate = new Date(lesson.date);
            const day = lessonDate.getDate().toString().padStart(2, "0");
            const month = (lessonDate.getMonth() + 1).toString().padStart(2, "0");

            return (
                <Link
                    key={lesson.id}
                    href={`${basePath}/aulas/${lesson.id}`}
                    className="group block"
                >
                    <div className={`
                        flex items-center gap-4 p-4 sm:p-5 border rounded-2xl transition-all duration-200 group-hover:shadow-sm
                        ${isLate
                            ? "bg-amber-50/50 border-amber-200 hover:border-amber-400 hover:bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900/50"
                            : "bg-surface border-surface-border hover:border-primary/40 hover:bg-primary/2"
                        }
                    `}>
                        <div className={`
                            flex items-center justify-center size-16 sm:size-14 rounded-xl font-bold shrink-0 transition-transform group-hover:scale-105 text-sm sm:text-base
                            ${isLate ? "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-400" : "bg-primary/10 text-primary"}
                        `}>
                            {day}/{month}
                        </div>

                        <div className="flex-1 flex flex-col min-w-0">
                            {isLate && (
                                <span className="flex w-max items-center px-2 py-0.5 rounded text-[10px] bg-amber-200 text-amber-800 dark:bg-amber-900 dark:text-amber-300 uppercase tracking-wider font-black">
                                    Chamada Pendente
                                </span>
                            )}
                            <h3 className="font-bold text-foreground text-sm sm:text-base truncate">
                                {lesson.topic}
                            </h3>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 overflow-hidden">
                                <span className="flex items-center gap-1.5 text-[10px] sm:text-sm text-muted-foreground whitespace-nowrap">
                                    <IconCalendarEvent className="size-3 sm:size-3.5 shrink-0" />
                                    <span className="capitalize">{formatWeekDay(lesson.date)}</span>
                                    <span>•</span>
                                    <span>{formatDate(lesson.date)}</span>
                                </span>

                                {lesson.timeSlot && (
                                    <span className="flex items-center gap-1.5 text-[10px] sm:text-sm text-muted-foreground whitespace-nowrap">
                                        <IconClock className="size-3 sm:size-3.5 shrink-0" />
                                        {lesson.timeSlot.startTime} - {lesson.timeSlot.endTime}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </Link>
            );
        }

        // Upcoming
        const upcoming = item.data;
        const upcomingDate = new Date(upcoming.date + "T00:00:00Z");
        const uDay = upcomingDate.getUTCDate().toString().padStart(2, "0");
        const uMonth = (upcomingDate.getUTCMonth() + 1).toString().padStart(2, "0");

        return (
            <div
                key={`upcoming-${upcoming.date}-${upcoming.scheduleId}-${index}`}
                className="flex items-center gap-4 p-4 sm:p-5 bg-surface/50 border border-dashed border-surface-border rounded-2xl opacity-60"
            >
                <div className="flex items-center justify-center size-16 sm:size-14 rounded-xl bg-muted text-muted-foreground font-bold shrink-0 text-sm sm:text-base">
                    {uDay}/{uMonth}
                </div>

                <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-muted-foreground text-sm sm:text-base truncate">
                        Aula prevista
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 overflow-hidden">
                        <span className="flex items-center gap-1.5 text-[10px] sm:text-sm text-muted-foreground whitespace-nowrap">
                            <IconCalendarEvent className="size-3 sm:size-3.5 shrink-0" />
                            <span className="capitalize">{formatWeekDay(upcoming.date + "T00:00:00Z")}</span>
                            <span>•</span>
                            <span>{formatDate(upcoming.date + "T00:00:00Z")}</span>
                        </span>

                        <span className="flex items-center gap-1.5 text-[10px] sm:text-sm text-muted-foreground whitespace-nowrap">
                            <IconClock className="size-3 sm:size-3.5 shrink-0" />
                            {upcoming.startTime} - {upcoming.endTime}
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-8">
            {pendingItems.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-1 flex items-center gap-2">
                        <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                        Próximas Aulas e Pendências
                    </h2>
                    <div className="space-y-3">
                        {pendingItems.map((item, index) => renderItem(item, index))}
                    </div>
                </div>
            )}

            {realizedItems.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-1 flex items-center gap-2">
                        <span className="size-1.5 rounded-full bg-emerald-500" />
                        Aulas Realizadas
                    </h2>
                    <div className="space-y-3">
                        {realizedItems.map((item, index) => renderItem(item, index))}
                    </div>
                </div>
            )}
        </div>
    );
}
