
import BaseForm from "@/components/base-form";
import Page from "@/components/page";
import Section from "@/components/section";
import SkeletonForm from "@/components/skeletons/skeleton-form";
import { getPeriodByProgramAndSlug } from "@/services/periods/periods.service";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { EditPeriodForm } from "./_components/edit-period-form";

export const metadata: Metadata = {
    title: "Editar Período",
};

async function EditPeriodPageContent({
    params,
}: Omit<PageProps<"/admin/[program]/periodos/[period]/editar">, "searchParams">) {
    const { program, period } = await params;

    const periodData = await getPeriodByProgramAndSlug(program, period);

    if (!periodData) {
        notFound();
    }

    return (
        <Page>
            <Section>
                <BaseForm title="Editar Período" description="Atualize os dados do período letivo">
                    <div className="mt-6">
                        <Suspense fallback={<SkeletonForm />}>
                            <EditPeriodForm
                                programSlug={program}
                                periodSlug={periodData.slug}
                                name={periodData.name}
                                startDate={periodData.startDate}
                                endDate={periodData.endDate}
                                completedAt={periodData.completedAt}
                            />
                        </Suspense>
                    </div>
                </BaseForm>
            </Section>
        </Page>
    );
}

export default function EditPeriodPage({
    params,
}: PageProps<"/admin/[program]/periodos/[period]/editar">) {
    return (
        <Suspense fallback={<SkeletonForm />}>
            <EditPeriodPageContent params={params} />
        </Suspense>
    );
}
