import Link from "next/link";
import { IconCalendarEvent, IconUser, IconClock, IconUsers, IconCalendarDue } from "@tabler/icons-react";
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
    const createdKeys = new Set(
        lessons.map((l) => {
            const d = new Date(l.date).toISOString().split("T")[0];
            return l.timeSlotId ? `${d}_${l.timeSlotId}` : `${d}_none`;
        }),
    );

    // Filtrar upcoming que não colidem com lessons criadas
    const filteredUpcoming = upcoming.filter((u) => {
        const key = `${u.date}_${u.scheduleId ? "" : ""}`;
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

    let lessonCounter = 0;

    return (
        <div className="space-y-3">
            {items.map((item, index) => {
                if (item.type === "lesson") {
                    lessonCounter++;
                    const lesson = item.data;
                    const attendanceCount = lesson._count.attendances;

                    return (
                        <Link
                            key={lesson.id}
                            href={`${basePath}/aulas/${lesson.id}`}
                            className="group block"
                        >
                            <div className="flex items-center gap-4 p-4 sm:p-5 bg-surface border border-surface-border rounded-2xl hover:border-primary/40 hover:bg-primary/[0.02] transition-all duration-200 group-hover:shadow-sm">
                                <div className="flex items-center justify-center size-10 sm:size-12 rounded-xl bg-primary/10 text-primary font-bold text-sm sm:text-base shrink-0 transition-transform group-hover:scale-105">
                                    {lessonCounter}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-foreground text-sm sm:text-base truncate">
                                        {lesson.topic}
                                    </h3>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5">
                                        <span className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
                                            <IconCalendarEvent className="size-3.5 shrink-0" />
                                            <span className="capitalize">{formatWeekDay(lesson.date)}</span>
                                            <span>•</span>
                                            <span>{formatDate(lesson.date)}</span>
                                        </span>

                                        {lesson.teacher && (
                                            <span className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
                                                <IconUser className="size-3.5 shrink-0" />
                                                {lesson.teacher.name}
                                            </span>
                                        )}

                                        {lesson.timeSlot && (
                                            <span className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
                                                <IconClock className="size-3.5 shrink-0" />
                                                {lesson.timeSlot.startTime} - {lesson.timeSlot.endTime}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-xs font-medium shrink-0">
                                    <IconUsers className="size-3.5" />
                                    {attendanceCount}
                                </div>
                            </div>
                        </Link>
                    );
                }

                // Upcoming (scheduled but not yet created)
                const upcoming = item.data;
                return (
                    <div
                        key={`upcoming-${upcoming.date}-${upcoming.scheduleId}-${index}`}
                        className="flex items-center gap-4 p-4 sm:p-5 bg-surface/50 border border-dashed border-surface-border rounded-2xl opacity-60"
                    >
                        <div className="flex items-center justify-center size-10 sm:size-12 rounded-xl bg-muted text-muted-foreground font-bold text-sm shrink-0">
                            <IconCalendarDue className="size-5" />
                        </div>

                        <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-muted-foreground text-sm sm:text-base truncate">
                                Aula prevista
                            </h3>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5">
                                <span className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
                                    <IconCalendarEvent className="size-3.5 shrink-0" />
                                    <span className="capitalize">{formatWeekDay(upcoming.date + "T00:00:00Z")}</span>
                                    <span>•</span>
                                    <span>{formatDate(upcoming.date + "T00:00:00Z")}</span>
                                </span>

                                <span className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
                                    <IconClock className="size-3.5 shrink-0" />
                                    {upcoming.startTime} - {upcoming.endTime}
                                </span>

                                {upcoming.teacherName && (
                                    <span className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
                                        <IconUser className="size-3.5 shrink-0" />
                                        {upcoming.teacherName}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-muted-foreground text-xs font-medium shrink-0">
                            Pendente
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
