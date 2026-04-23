import BaseForm from "@/components/base-form";
import Page from "@/components/page";
import Section from "@/components/section";
import SkeletonForm from "@/components/skeletons/skeleton-form";
import { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getPeriodByProgramAndSlug } from "@/services/periods/periods.service";
import { getClassGroupByPeriodIdAndSlug } from "@/services/class-groups/class-groups.service";
import { getSubjectsByDegreeAndBasePeriod } from "@/services/subjects/subjects.service";
import { getAllRooms } from "@/services/rooms/rooms.service";
import { getTeachers, getTimeSlotsByProgramSlug } from "@/services/schedules/schedules.service";
import { CreateClassGroupSubjectForm } from "./_components/create-class-group-subject-form";

export const metadata: Metadata = {
    title: "Adicionar Disciplina na Turma",
};

async function NewClassGroupSubjectContent({
    params,
}: {
    params: Promise<{ program: string; period: string; classGroup: string }>;
}) {
    const { program, period: periodSlug, classGroup: classGroupSlug } = await params;

    const period = await getPeriodByProgramAndSlug(program, periodSlug);
    if (!period) {
        notFound();
    }

    const classGroup = await getClassGroupByPeriodIdAndSlug(period.id, classGroupSlug);
    if (!classGroup) {
        notFound();
    }

    const allSubjects = await getSubjectsByDegreeAndBasePeriod(classGroup.degreeId, classGroup.basePeriod);
    const usedSubjectIds = new Set(classGroup.courses.map((course) => course.subjectId));
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
                    title="Adicionar Disciplina na Turma"
                    description={`Selecione uma disciplina curricular para ofertar na turma ${classGroup.name}.`}
                >
                    <div className="mt-6">
                        <Suspense fallback={<SkeletonForm />}>
                            <CreateClassGroupSubjectForm
                                programSlug={program}
                                periodSlug={periodSlug}
                                classGroupSlug={classGroupSlug}
                                classGroup={{
                                    id: classGroup.id,
                                    name: classGroup.name,
                                    slug: classGroup.slug,
                                    shift: classGroup.shift,
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
                        </Suspense>
                    </div>
                </BaseForm>
            </Section>
        </Page>
    );
}

export default function NewClassGroupSubjectPage({
    params,
}: {
    params: Promise<{ program: string; period: string; classGroup: string }>;
}) {
    return <NewClassGroupSubjectContent params={params} />;
}
