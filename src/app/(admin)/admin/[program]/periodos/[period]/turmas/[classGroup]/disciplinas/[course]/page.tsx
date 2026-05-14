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
import { Shift } from "@/generated/prisma/enums";
import { Metadata } from "next";
import LessonCardList from "./_components/lesson-card-list";
import { CreateLessonDialog } from "./_components/create-lesson-dialog";

export const metadata: Metadata = {
    title: "Detalhes da Disciplina",
};

const shiftMap: Record<Shift, string> = {
    MORNING: "MATUTINO",
    AFTERNOON: "VESPERTINO",
    EVENING: "NOTURNO",
};

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
                        <h2 className="text-xl font-bold text-foreground">Diário de Aulas</h2>
                    </div>
                    <CreateLessonDialog
                        programSlug={program}
                        periodSlug={period}
                        classGroupSlug={classGroupSlug}
                        courseCode={courseCode}
                    />
                </div>

                <LessonCardList
                    lessons={lessons}
                    basePath={basePath}
                />
            </Section>
        </Page>
    );
}