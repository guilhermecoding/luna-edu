import BaseForm from "@/components/base-form";
import Page from "@/components/page";
import Section from "@/components/section";
import { Suspense } from "react";
import { CreateCourseForm } from "./_components/create-course-form";
import { Metadata } from "next";
import SkeletonForm from "@/components/skeletons/skeleton-form";
import { getPeriodByProgramAndSlug } from "@/services/periods/periods.service";
import { getSubjectsByProgramSlug } from "@/services/subjects/subjects.service";
import { getAllRooms } from "@/services/rooms/rooms.service";
import { getTimeSlotsByProgramSlug, getTeachers } from "@/services/schedules/schedules.service";
import { getClassGroupsByPeriodId } from "@/services/class-groups/class-groups.service";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
    title: "Nova Turma",
};

async function NewCourseContent({
    params,
}: {
    params: Promise<{ program: string; period: string }>;
}) {
    const { program, period } = await params;

    const periodData = await getPeriodByProgramAndSlug(program, period);

    if (!periodData) {
        notFound();
    }

    const [subjects, rooms, timeSlots, teachers, classGroups] = await Promise.all([
        getSubjectsByProgramSlug(program),
        getAllRooms(),
        getTimeSlotsByProgramSlug(program),
        getTeachers(),
        getClassGroupsByPeriodId(periodData.id),
    ]);

    return (
        <Page>
            <Section>
                <BaseForm
                    title="Nova Turma"
                    description={`Cadastre uma nova turma para o período ${periodData.name}.`}
                >
                    <div className="mt-6">
                        <Suspense fallback={<SkeletonForm />}>
                            <CreateCourseForm
                                programSlug={program}
                                periodSlug={period}
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

export default function NewCoursePage({
    params,
}: {
    params: Promise<{ program: string; period: string }>;
}) {
    return <NewCourseContent params={params} />;
}
