import BaseForm from "@/components/base-form";
import Page from "@/components/page";
import Section from "@/components/section";
import { Suspense } from "react";
import { EditClassGroupForm } from "./_components/edit-class-group-form";
import { Metadata } from "next";
import SkeletonForm from "@/components/skeletons/skeleton-form";
import { getPeriodByProgramAndSlug } from "@/services/periods/periods.service";
import { getClassGroupByPeriodIdAndSlug } from "@/services/class-groups/class-groups.service";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
    title: "Editar Turma",
};

async function EditClassGroupContent({
    params,
}: {
    params: Promise<{ program: string; period: string; classGroup: string }>;
}) {
    const { program, period: periodSlug, classGroup: token } = await params;
    
    const period = await getPeriodByProgramAndSlug(program, periodSlug);
    
    if (!period) {
        notFound();
    }

    const classGroup = await getClassGroupByPeriodIdAndSlug(period.id, token);
    if (!classGroup) {
        notFound();
    }

    return (
        <Page>
            <Section>
                <BaseForm
                    title="Editar Turma"
                    description={`Atualize os dados da turma ${classGroup.name}.`}
                >
                    <div className="mt-6">
                        <EditClassGroupForm
                            programSlug={program}
                            periodSlug={periodSlug}
                            classGroupSlug={classGroup.slug}
                            defaultValues={{
                                name: classGroup.name,
                                slug: classGroup.slug,
                                degreeName: classGroup.degree.name,
                                basePeriod: classGroup.basePeriod,
                                shift: classGroup.shift,
                            }}
                        />
                    </div>
                </BaseForm>
            </Section>
        </Page>
    );
}

export default function EditClassGroupPage({
    params,
}: {
    params: Promise<{ program: string; period: string; classGroup: string }>;
}) {
    return (
        <Suspense fallback={<SkeletonForm />}>
            <EditClassGroupContent params={params} />
        </Suspense>
    );
}
