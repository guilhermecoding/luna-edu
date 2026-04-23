import BaseForm from "@/components/base-form";
import Page from "@/components/page";
import Section from "@/components/section";
import SkeletonForm from "@/components/skeletons/skeleton-form";
import { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getClassGroupByPeriodIdAndSlug } from "@/services/class-groups/class-groups.service";
import { getCourseByPeriodIdAndCode } from "@/services/courses/courses.service";
import { getPeriodByProgramAndSlug } from "@/services/periods/periods.service";
import { getSubjectsByDegreeAndBasePeriod } from "@/services/subjects/subjects.service";
import { getAllRooms } from "@/services/rooms/rooms.service";
import { getTeachers, getTimeSlotsByProgramSlug } from "@/services/schedules/schedules.service";
import { EditClassGroupSubjectForm } from "./_components/edit-class-group-subject-form";

export const metadata: Metadata = {
    title: "Editar Disciplina da Turma",
};

async function EditClassGroupCourseContent({
    params,
}: {
    params: Promise<{ program: string; period: string; classGroup: string; course: string }>;
}) {
    const {
        program,
        period: periodSlug,
        classGroup: classGroupSlug,
        course: courseCode,
    } = await params;

    const period = await getPeriodByProgramAndSlug(program, periodSlug);
    if (!period) {
        notFound();
    }

    const classGroup = await getClassGroupByPeriodIdAndSlug(period.id, classGroupSlug);
    if (!classGroup) {
        notFound();
    }

    const course = await getCourseByPeriodIdAndCode(period.id, courseCode);
    if (!course || course.classGroupId !== classGroup.id) {
        notFound();
    }

    const allSubjects = await getSubjectsByDegreeAndBasePeriod(classGroup.degreeId, classGroup.basePeriod);
    const usedSubjectIds = new Set(
        classGroup.courses
            .filter((groupCourse) => groupCourse.id !== course.id)
            .map((groupCourse) => groupCourse.subjectId),
    );
    const availableSubjects = allSubjects.filter((subject) => !usedSubjectIds.has(subject.id));
    const [rooms, timeSlots, teachers] = await Promise.all([
        getAllRooms(),
        getTimeSlotsByProgramSlug(program),
        getTeachers(),
    ]);

    return (
        <Page>
            <Section>
                <BaseForm
                    title="Editar Disciplina da Turma"
                    description={`Atualize os dados da disciplina ${course.name}.`}
                >
                    <div className="mt-6">
                        <EditClassGroupSubjectForm
                            programSlug={program}
                            periodSlug={periodSlug}
                            classGroupSlug={classGroupSlug}
                            courseCode={course.code}
                            defaultValues={{
                                name: course.name,
                                code: course.code,
                                subjectId: course.subjectId,
                                shift: course.shift,
                                roomId: course.roomId || "",
                                schedules: course.schedules.map((schedule) => ({
                                    dayOfWeek: schedule.dayOfWeek,
                                    timeSlotId: schedule.timeSlotId,
                                    teacherId: schedule.teacherId || "",
                                    roomId: schedule.roomId || "",
                                })),
                            }}
                            subjects={availableSubjects.map((subject) => ({
                                id: subject.id,
                                name: subject.name,
                                code: subject.code,
                            }))}
                            rooms={rooms}
                            timeSlots={timeSlots}
                            teachers={teachers}
                        />
                    </div>
                </BaseForm>
            </Section>
        </Page>
    );
}

export default function EditClassGroupCoursePage({
    params,
}: {
    params: Promise<{ program: string; period: string; classGroup: string; course: string }>;
}) {
    return (
        <Suspense fallback={<SkeletonForm />}>
            <EditClassGroupCourseContent params={params} />
        </Suspense>
    );
}
