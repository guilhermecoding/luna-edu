import BaseForm from "@/components/base-form";
import Page from "@/components/page";
import Section from "@/components/section";
import { Suspense } from "react";
import { EditCourseForm } from "./_components/edit-course-form";
import { Metadata } from "next";
import SkeletonForm from "@/components/skeletons/skeleton-form";
import { getCourseByPeriodIdAndCode } from "@/services/courses/courses.service";
import { getSubjectsByProgramSlug } from "@/services/subjects/subjects.service";
import { getAllRooms } from "@/services/rooms/rooms.service";
import { getTimeSlotsByProgramSlug, getTeachers } from "@/services/schedules/schedules.service";
import { getPeriodByProgramAndSlug } from "@/services/periods/periods.service";
import { getClassGroupsByPeriodId } from "@/services/class-groups/class-groups.service";
import { notFound } from "next/navigation";
import type { ScheduleEntryInput } from "../../schema";

export const metadata: Metadata = {
    title: "Editar Turma",
};

async function EditCourseContent({
    params,
}: {
    params: Promise<{ program: string; period: string; course: string }>;
}) {
    const { program, period: periodSlug, course: courseCode } = await params;
    
    const period = await getPeriodByProgramAndSlug(program, periodSlug);
    
    if (!period) {
        notFound();
    }

    const [courseData, subjects, rooms, timeSlots, teachers, classGroups] = await Promise.all([
        getCourseByPeriodIdAndCode(period.id, courseCode),
        getSubjectsByProgramSlug(program),
        getAllRooms(),
        getTimeSlotsByProgramSlug(program),
        getTeachers(),
        getClassGroupsByPeriodId(period.id),
    ]);

    if (!courseData) {
        notFound();
    }

    // Map existing schedules to the form format
    const existingSchedules: ScheduleEntryInput[] = courseData.schedules.map((s) => ({
        dayOfWeek: s.dayOfWeek as ScheduleEntryInput["dayOfWeek"],
        timeSlotId: s.timeSlotId,
        teacherId: s.teacherId ?? "",
        roomId: s.roomId ?? "",
    }));

    return (
        <Page>
            <Section>
                <BaseForm
                    title="Editar Turma"
                    description={`Atualize os dados da turma ${courseData.name}.`}
                >
                    <div className="mt-6">
                        <Suspense fallback={<SkeletonForm />}>
                            <EditCourseForm
                                programSlug={program}
                                periodSlug={periodSlug}
                                courseCode={courseCode}
                                defaultValues={{
                                    name: courseData.name,
                                    code: courseData.code ?? courseCode,
                                    subjectId: courseData.subjectId,
                                    roomId: courseData.roomId ?? "",
                                    shift: courseData.shift,
                                    classGroupId: courseData.classGroupId ?? "",
                                    schedules: existingSchedules,
                                }}
                                subjects={subjects}
                                rooms={rooms}
                                timeSlots={timeSlots}
                                teachers={teachers}
                                classGroups={classGroups}
                            />
                        </Suspense>
                    </div>
                </BaseForm>
            </Section>
        </Page>
    );
}

export default function EditCoursePage({
    params,
}: {
    params: Promise<{ program: string; period: string; course: string }>;
}) {
    return (
        <Suspense fallback={<SkeletonForm />}>
            <EditCourseContent params={params} />
        </Suspense>
    );
}
