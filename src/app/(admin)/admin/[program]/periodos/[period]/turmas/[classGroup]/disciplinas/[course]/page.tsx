import Page from "@/components/page";
import Section from "@/components/section";
import TitlePage from "@/components/title-page";
import { ButtonLink } from "@/components/ui/button-link";
import InfoBoxPeriod from "../../../../_components/info-box-period";
import { getPeriodByProgramAndSlug } from "@/services/periods/periods.service";
import { getClassGroupByPeriodIdAndSlug } from "@/services/class-groups/class-groups.service";
import { getCourseByPeriodIdAndCode } from "@/services/courses/courses.service";
import { getStudentCountByClassGroupId } from "@/services/students/students.service";
import { getLessonsByCourseId, getLessonsCountByCourseId } from "@/services/lessons/lessons.service";
import {
    IconBooks,
    IconCalendarEvent,
    IconClockHour2,
    IconPencil,
    IconUsers,
    IconUser,
} from "@tabler/icons-react";
import { notFound } from "next/navigation";
import { Shift, DayOfWeek } from "@/generated/prisma/enums";
import { Metadata } from "next";
import LessonCardList from "./_components/lesson-card-list";
import { CreateLessonSheet } from "./_components/create-lesson-dialog";

export const metadata: Metadata = {
    title: "Detalhes da Disciplina",
};

const shiftMap: Record<Shift, string> = {
    MORNING: "MATUTINO",
    AFTERNOON: "VESPERTINO",
    EVENING: "NOTURNO",
};

// Mapeia DayOfWeek do Prisma para o número JS de getDay() (0=Dom, 1=Seg, ..., 6=Sáb)
const dayOfWeekToJs: Record<DayOfWeek, number> = {
    SUNDAY: 0,
    MONDAY: 1,
    TUESDAY: 2,
    WEDNESDAY: 3,
    THURSDAY: 4,
    FRIDAY: 5,
    SATURDAY: 6,
};

/**
 * Gera as datas de aulas futuras (a partir de hoje) com base nos schedules
 * da disciplina dentro do intervalo do período.
 */
function generateUpcomingLessons(
    schedules: {
        id: string;
        dayOfWeek: DayOfWeek;
        timeSlotId: string;
        timeSlot: { id: string; name: string; startTime: string; endTime: string };
        teacher: { id: string; name: string } | null;
    }[],
    periodStart: Date,
    periodEnd: Date,
    existingLessons: { date: Date; timeSlotId: string | null }[],
) {
    if (schedules.length === 0) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = new Date(Math.max(periodStart.getTime(), today.getTime()));
    const end = new Date(periodEnd);

    // Criar um Set de chaves já ocupadas: "YYYY-MM-DD_timeSlotId"
    const occupiedKeys = new Set(
        existingLessons
            .filter((l) => l.timeSlotId)
            .map((l) => {
                const d = new Date(l.date).toISOString().split("T")[0];
                return `${d}_${l.timeSlotId}`;
            }),
    );

    const upcoming: {
        date: string;
        dayOfWeek: string;
        scheduleId: string;
        timeSlotName: string;
        startTime: string;
        endTime: string;
        teacherName: string | null;
    }[] = [];

    // Iterar dia a dia do start ao end
    const cursor = new Date(start);
    while (cursor <= end) {
        const jsDay = cursor.getUTCDay();
        const dateStr = cursor.toISOString().split("T")[0];

        for (const schedule of schedules) {
            if (dayOfWeekToJs[schedule.dayOfWeek] === jsDay) {
                const key = `${dateStr}_${schedule.timeSlotId}`;
                if (!occupiedKeys.has(key)) {
                    upcoming.push({
                        date: dateStr,
                        dayOfWeek: schedule.dayOfWeek,
                        scheduleId: schedule.id,
                        timeSlotName: schedule.timeSlot.name,
                        startTime: schedule.timeSlot.startTime,
                        endTime: schedule.timeSlot.endTime,
                        teacherName: schedule.teacher?.name || null,
                    });
                }
            }
        }

        cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    return upcoming;
}

export default async function CoursePage({
    params,
}: {
    params: Promise<{ program: string; period: string; classGroup: string; course: string }>;
}) {
    const { program, period, classGroup: classGroupSlug, course: courseCode } = await params;

    const periodData = await getPeriodByProgramAndSlug(program, period);
    if (!periodData) notFound();

    const classGroupData = await getClassGroupByPeriodIdAndSlug(periodData.id, classGroupSlug);
    if (!classGroupData) notFound();

    const courseData = await getCourseByPeriodIdAndCode(periodData.id, courseCode);
    if (!courseData || courseData.classGroupId !== classGroupData.id) notFound();

    const [studentCount, lessonsCount, lessons] = await Promise.all([
        getStudentCountByClassGroupId(classGroupData.id),
        getLessonsCountByCourseId(courseData.id),
        getLessonsByCourseId(courseData.id),
    ]);

    const teacher = courseData.schedules.find((s) => s.teacher)?.teacher?.name || "Não atribuído";
    const basePath = `/admin/${program}/periodos/${period}/turmas/${classGroupSlug}/disciplinas/${courseCode}`;

    // Gerar aulas futuras com base na grade de horários
    const schedulesWithTimeSlot = courseData.schedules.filter((s) => s.timeSlot);
    const upcomingLessons = generateUpcomingLessons(
        schedulesWithTimeSlot.map((s) => ({
            id: s.id,
            dayOfWeek: s.dayOfWeek as DayOfWeek,
            timeSlotId: s.timeSlotId,
            timeSlot: s.timeSlot,
            teacher: s.teacher,
        })),
        courseData.period.startDate,
        courseData.period.endDate,
        lessons.map((l) => ({ date: l.date, timeSlotId: l.timeSlotId })),
    );

    // Preparar schedules para o Sheet de criação
    const scheduleOptions = courseData.schedules
        .filter((s) => s.timeSlot)
        .map((s) => ({
            id: s.id,
            dayOfWeek: s.dayOfWeek,
            timeSlotId: s.timeSlotId,
            timeSlotName: s.timeSlot.name,
            startTime: s.timeSlot.startTime,
            endTime: s.timeSlot.endTime,
            teacherId: s.teacherId,
            teacherName: s.teacher?.name || null,
        }));

    return (
        <Page>
            <Section>
                <div className="flex flex-row items-center gap-1 mb-3">
                    <IconBooks className="size-4 text-muted-foreground" />
                    <p className="text-muted-foreground font-bold">Detalhes da Disciplina</p>
                </div>
                <div className="flex flex-col lg:flex-row gap-y-6">
                    <div className="flex-1">
                        <TitlePage
                            title={courseData.name}
                            description={`Disciplina ${courseData.name} da turma ${classGroupData.name}.`}
                        />
                    </div>
                    <div className="flex flex-col sm:flex-row flex-1 gap-3 justify-end items-end">
                        <ButtonLink
                            className="w-full sm:w-auto bg-transparent border-2 border-dashed border-primary hover:bg-primary text-primary hover:text-background hover:border-solid"
                            href={`${basePath}/editar`}
                        >
                            <IconPencil className="size-5" />
                            Editar Disciplina
                        </ButtonLink>
                    </div>
                </div>
            </Section>

            <Section className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <InfoBoxPeriod
                    label="ALUNOS MATRICULADOS"
                    value={studentCount}
                    color="emerald"
                    icon={<IconUsers className="size-full" />}
                />
                <InfoBoxPeriod
                    label="AULAS REGISTRADAS"
                    value={lessonsCount}
                    color="indigo"
                    icon={<IconCalendarEvent className="size-full" />}
                />
                <InfoBoxPeriod
                    label="TURNO"
                    value={shiftMap[courseData.shift] || courseData.shift}
                    color="amber"
                    icon={<IconClockHour2 className="size-full" />}
                />
                <InfoBoxPeriod
                    label="PROFESSOR"
                    value={teacher}
                    color="purple"
                    icon={<IconUser className="size-full" />}
                />
            </Section>

            <Section className="mt-12">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <div className="flex flex-row items-center gap-2">
                        <div className="bg-primary/10 p-2 rounded-lg">
                            <IconCalendarEvent className="size-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-foreground">Diário de Aulas</h2>
                            {upcomingLessons.length > 0 && (
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    {lessonsCount} registrada{lessonsCount !== 1 ? "s" : ""} • {upcomingLessons.length} prevista{upcomingLessons.length !== 1 ? "s" : ""}
                                </p>
                            )}
                        </div>
                    </div>
                    <CreateLessonSheet
                        programSlug={program}
                        periodSlug={period}
                        classGroupSlug={classGroupSlug}
                        courseCode={courseCode}
                        schedules={scheduleOptions}
                    />
                </div>

                <LessonCardList
                    lessons={lessons}
                    upcomingLessons={upcomingLessons}
                    basePath={basePath}
                />
            </Section>
        </Page>
    );
}