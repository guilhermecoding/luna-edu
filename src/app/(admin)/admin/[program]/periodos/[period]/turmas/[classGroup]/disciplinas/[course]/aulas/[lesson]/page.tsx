import Page from "@/components/page";
import Section from "@/components/section";
import TitlePage from "@/components/title-page";
import InfoBoxPeriod from "../../../../../../_components/info-box-period";
import { getPeriodByProgramAndSlug } from "@/services/periods/periods.service";
import { getClassGroupByPeriodIdAndSlug } from "@/services/class-groups/class-groups.service";
import { getCourseByPeriodIdAndCode } from "@/services/courses/courses.service";
import {
    getLessonById,
    getAttendancesByLessonId,
    getAttendanceStatsByLessonId,
} from "@/services/lessons/lessons.service";
import {
    IconCheck,
    IconUsers,
    IconX,
    IconNotebook,
    IconClock,
} from "@tabler/icons-react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { AttendanceTable } from "./_components/attendance-table";

export const metadata: Metadata = {
    title: "Registro de Presença",
};

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

export default async function LessonPage({
    params,
}: {
    params: Promise<{ program: string; period: string; classGroup: string; course: string; lesson: string }>;
}) {
    const {
        program,
        period,
        classGroup: classGroupSlug,
        course: courseCode,
        lesson: lessonId,
    } = await params;

    const periodData = await getPeriodByProgramAndSlug(program, period);
    if (!periodData) notFound();

    const classGroupData = await getClassGroupByPeriodIdAndSlug(periodData.id, classGroupSlug);
    if (!classGroupData) notFound();

    const courseData = await getCourseByPeriodIdAndCode(periodData.id, courseCode);
    if (!courseData || courseData.classGroupId !== classGroupData.id) notFound();

    const lesson = await getLessonById(lessonId);
    if (!lesson || lesson.course.id !== courseData.id) notFound();

    const [attendances, stats] = await Promise.all([
        getAttendancesByLessonId(lessonId),
        getAttendanceStatsByLessonId(lessonId),
    ]);

    return (
        <Page>
            <Section>
                <div className="flex flex-row items-center gap-1 mb-3">
                    <IconNotebook className="size-4 text-muted-foreground" />
                    <p className="text-muted-foreground font-bold">Registro de Presença</p>
                </div>
                <div className="flex flex-col lg:flex-row gap-y-6">
                    <div className="flex-1 capitalize">
                        <TitlePage
                            title={lesson.topic}
                            description={`${formatWeekDay(lesson.date)} • ${formatDate(lesson.date)} — ${courseData.name}`}
                        />
                        {lesson.attendanceUpdatedAt && (() => {
                            const date = new Date(lesson.attendanceUpdatedAt);
                            const now = new Date();
                            const yesterday = new Date();
                            yesterday.setDate(now.getDate() - 1);

                            const isToday = date.toLocaleDateString("pt-BR") === now.toLocaleDateString("pt-BR");
                            const isYesterday = date.toLocaleDateString("pt-BR") === yesterday.toLocaleDateString("pt-BR");

                            const timeStr = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(date);
                            const dateStr = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" }).format(date);

                            let label = `CHAMADA REALIZADA ${dateStr} ÀS ${timeStr}`;
                            if (isToday) label = `CHAMADA REALIZADA HOJE ÀS ${timeStr}`;
                            if (isYesterday) label = `CHAMADA REALIZADA ONTEM ÀS ${timeStr}`;

                            return (
                                <div className="inline-flex items-center gap-2 px-3 py-1 mt-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] sm:text-xs font-bold animate-in fade-in zoom-in duration-500 uppercase tracking-wider">
                                    <IconClock className="size-3.5" />
                                    {label}
                                </div>
                            );
                        })()}
                    </div>
                </div>
            </Section>

            <Section className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <InfoBoxPeriod
                    label="TOTAL DE ALUNOS"
                    value={stats.total}
                    color="indigo"
                    icon={<IconUsers className="size-full" />}
                />
                <InfoBoxPeriod
                    label="PRESENTES"
                    value={stats.present}
                    color="emerald"
                    icon={<IconCheck className="size-full" />}
                />
                <InfoBoxPeriod
                    label="AUSENTES"
                    value={stats.absent}
                    color="rose"
                    icon={<IconX className="size-full" />}
                />
            </Section>

            <Section className="mt-12">
                <div className="flex flex-row items-center gap-2 mb-6">
                    <div className="bg-primary/10 p-2 rounded-lg">
                        <IconUsers className="size-5 text-primary" />
                    </div>
                    <h2 className="text-xl font-bold text-foreground">Lista de Chamada</h2>
                </div>

                <AttendanceTable
                    attendances={attendances}
                    courseId={courseData.id}
                    lessonId={lessonId}
                />
            </Section>
        </Page>
    );
}
