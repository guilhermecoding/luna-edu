import BaseForm from "@/components/base-form";
import Page from "@/components/page";
import Section from "@/components/section";
import { Suspense } from "react";
import { CreateClassGroupForm } from "./_components/create-class-group-form";
import { Metadata } from "next";
import SkeletonForm from "@/components/skeletons/skeleton-form";
import { getPeriodByProgramAndSlug } from "@/services/periods/periods.service";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
    title: "Novo Grupo",
};

async function NewClassGroupContent({
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
                    title="Novo Grupo (Turma Física)"
                    description={`Crie um grupo de alunos para o período ${periodData.name}. Ex: "1º Ano A", "2ª Série B".`}
                >
                    <div className="mt-6">
                        <Suspense fallback={<SkeletonForm />}>
                            <CreateClassGroupForm
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

export default function NewClassGroupPage({
    params,
}: {
    params: Promise<{ program: string; period: string }>;
}) {
    return <NewClassGroupContent params={params} />;
}
