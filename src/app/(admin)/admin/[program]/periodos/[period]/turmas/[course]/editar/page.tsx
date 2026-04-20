import BaseForm from "@/components/base-form";
import Page from "@/components/page";
import Section from "@/components/section";
import { Suspense } from "react";
import { EditCourseForm } from "./_components/edit-course-form";
import { Metadata } from "next";
import SkeletonForm from "@/components/skeletons/skeleton-form";
import { getCourseByCode } from "@/services/courses/courses.service";
import { getSubjectsByProgramSlug } from "@/services/subjects/subjects.service";
import { getAllRooms } from "@/services/rooms/rooms.service";
import { getTimeSlotsByProgramSlug, getTeachers } from "@/services/schedules/schedules.service";
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
    const { program, period, course: courseCode } = await params;

    const [courseData, subjects, rooms, timeSlots, teachers] = await Promise.all([
        getCourseByCode(courseCode),
        getSubjectsByProgramSlug(program),
        getAllRooms(),
        getTimeSlotsByProgramSlug(program),
        getTeachers(),
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
                                periodSlug={period}
                                courseCode={courseCode}
                                defaultValues={{
                                    name: courseData.name,
                                    subjectId: courseData.subjectId,
                                    roomId: courseData.roomId ?? "",
                                    shift: courseData.shift,
                                    schedules: existingSchedules,
                                }}
                                subjects={subjects}
                                rooms={rooms}
                                timeSlots={timeSlots}
                                teachers={teachers}
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
