import BaseForm from "@/components/base-form";
import Page from "@/components/page";
import Section from "@/components/section";
import { Suspense } from "react";
import { CreateClassForm } from "./_components/create-class-form";
import { Metadata } from "next";
import SkeletonForm from "@/components/skeletons/skeleton-form";
import { getPeriodByProgramAndSlug } from "@/services/periods/periods.service";
import { getSubjectsByProgramSlug } from "@/services/subjects/subjects.service";
import { getProgramBySlug } from "@/services/programs/programs.service";
import { getDegreesByProgramId } from "@/services/degrees/degrees.service";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
    title: "Nova Classe",
};

async function NewClassContent({
    params,
}: {
    params: Promise<{ program: string; period: string }>;
}) {
    const { program, period } = await params;

    const [periodData, programData] = await Promise.all([
        getPeriodByProgramAndSlug(program, period),
        getProgramBySlug(program),
    ]);

    if (!periodData || !programData) {
        notFound();
    }

    const [degrees, subjects] = await Promise.all([
        getDegreesByProgramId(programData.id),
        getSubjectsByProgramSlug(program),
    ]);

    return (
        <Page>
            <Section>
                <BaseForm
                    title="Nova Classe"
                    description={"Selecione a Matriz e a Série. O sistema criará automaticamente as disciplinas ofertadas."}
                >
                    <div className="mt-6">
                        <Suspense fallback={<SkeletonForm />}>
                            <CreateClassForm
                                programSlug={program}
                                periodSlug={period}
                                degrees={degrees.map((d) => ({
                                    id: d.id,
                                    name: d.name,
                                    slug: d.slug,
                                }))}
                                subjects={subjects.map((s) => ({
                                    id: s.id,
                                    name: s.name,
                                    code: s.code,
                                    basePeriod: s.basePeriod,
                                    degreeId: s.degreeId,
                                }))}
                            />
                        </Suspense>
                    </div>
                </BaseForm>
            </Section>
        </Page>
    );
}

export default function NewClassPage({
    params,
}: {
    params: Promise<{ program: string; period: string }>;
}) {
    return <NewClassContent params={params} />;
}
