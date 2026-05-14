import Link from "next/link";
import { IconCalendarEvent, IconUser, IconClock, IconUsers } from "@tabler/icons-react";
import type { LessonListItem } from "@/services/lessons/lessons.service";

interface LessonCardListProps {
    lessons: LessonListItem[];
    basePath: string;
}

function formatDate(date: Date) {
    return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
    }).format(new Date(date));
}

function formatWeekDay(date: Date) {
    return new Intl.DateTimeFormat("pt-BR", {
        weekday: "long",
        timeZone: "UTC",
    }).format(new Date(date));
}

export default function LessonCardList({ lessons, basePath }: LessonCardListProps) {
    if (lessons.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-surface-border rounded-4xl">
                <IconCalendarEvent className="size-12 text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-lg font-semibold">Nenhuma aula registrada</h3>
                <p className="text-muted-foreground mt-2 max-w-sm">
                    Clique em &quot;Nova Aula&quot; para registrar a primeira aula desta disciplina.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {lessons.map((lesson, index) => {
                const attendanceCount = lesson._count.attendances;

                return (
                    <Link
                        key={lesson.id}
                        href={`${basePath}/aulas/${lesson.id}`}
                        className="group block"
                    >
                        <div className="flex items-center gap-4 p-4 sm:p-5 bg-surface border border-surface-border rounded-2xl hover:border-primary/40 hover:bg-primary/[0.02] transition-all duration-200 group-hover:shadow-sm">
                            {/* Número da aula */}
                            <div className="flex items-center justify-center size-10 sm:size-12 rounded-xl bg-primary/10 text-primary font-bold text-sm sm:text-base shrink-0 transition-transform group-hover:scale-105">
                                {index + 1}
                            </div>

                            {/* Conteúdo principal */}
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                                    <h3 className="font-bold text-foreground text-sm sm:text-base truncate">
                                        {lesson.topic}
                                    </h3>
                                </div>
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

                            {/* Badge de presenças */}
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-xs font-medium shrink-0">
                                <IconUsers className="size-3.5" />
                                {attendanceCount}
                            </div>
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}
