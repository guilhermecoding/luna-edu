import BaseForm from "@/components/base-form";
import Page from "@/components/page";
import Section from "@/components/section";
import { Suspense } from "react";
import { CreateSubPeriodForm } from "./_components/create-sub-period-form";
import { Metadata } from "next";
import SkeletonForm from "@/components/skeletons/skeleton-form";
import { getPeriodByProgramAndSlug } from "@/services/periods/periods.service";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
    title: "Nova Etapa",
};

async function NewSubPeriodContent({
    params,
}: {
    params: Promise<{ program: string; period: string }>;
}) {
    const { program, period } = await params;
    const periodData = await getPeriodByProgramAndSlug(program, period);

    if (!periodData) {
        notFound();
    }

    return (
        <Page>
            <Section>
                <BaseForm
                    title="Nova Etapa Avaliativa"
                    description={`Crie um bimestre ou trimestre para o período ${periodData.name}.`}
                >
                    <div className="mt-6">
                        <Suspense fallback={<SkeletonForm />}>
                            <CreateSubPeriodForm
                                programSlug={program}
                                periodSlug={period}
                            />
                        </Suspense>
                    </div>
                </BaseForm>
            </Section>
        </Page>
    );
}

export default function NewSubPeriodPage({
    params,
}: {
    params: Promise<{ program: string; period: string }>;
}) {
    return <NewSubPeriodContent params={params} />;
}
