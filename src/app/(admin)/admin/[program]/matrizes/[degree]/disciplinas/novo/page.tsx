import BaseForm from "@/components/base-form";
import Page from "@/components/page";
import Section from "@/components/section";
import { Suspense } from "react";
import { CreateSubjectForm } from "./_components/create-subject-form";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Nova Disciplina Teórica",
};

export default async function NewSubjectPage({
    params,
}: PageProps<"/admin/[program]/matrizes/[degree]/disciplinas/novo">) {
    const { program, degree } = await params;

    return (
        <Page>
            <Section>
                <BaseForm
                    title="Nova Disciplina/Matéria"
                    description="Adicione uma disciplina base teórica a grade curricular."
                >
                    <div className="mt-6">
                        <Suspense fallback={null}>
                            <CreateSubjectForm programSlug={program} degreeSlug={degree} />
                        </Suspense>
                    </div>
                </BaseForm>
            </Section>
        </Page>
    );
}
