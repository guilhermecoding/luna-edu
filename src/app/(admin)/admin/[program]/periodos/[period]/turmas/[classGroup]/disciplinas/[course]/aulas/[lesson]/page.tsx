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

    const coursePath = `/admin/${program}/periodos/${period}/turmas/${classGroupSlug}/disciplinas/${courseCode}`;

    return (
        <Page>
            <Section>
                <div className="flex flex-row items-center gap-1 mb-3">
                    <IconNotebook className="size-4 text-muted-foreground" />
                    <p className="text-muted-foreground font-bold">Registro de Presença</p>
                </div>
                <div className="flex flex-col lg:flex-row gap-y-6">
                    <div className="flex-1">
                        <TitlePage
                            title={lesson.topic}
                            description={`${formatWeekDay(lesson.date)} • ${formatDate(lesson.date)} — ${courseData.name}`}
                        />
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
