import BaseForm from "@/components/base-form";
import Page from "@/components/page";
import Section from "@/components/section";
import { Suspense } from "react";
import { CreateDegreeForm } from "./_components/create-degree-form";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Nova Matriz Curricular",
};

export default async function NewDegreePage({
    params,
}: PageProps<"/admin/[program]/matrizes/novo">) {
    const { program } = await params;

    return (
        <Page>
            <Section>
                <BaseForm
                    title="Nova Matriz Curricular"
                    description="Adicione uma estrutura de curso/matriz para agrupar disciplinas"
                >
                    <div className="mt-6">
                        <Suspense fallback={null}>
                            <CreateDegreeForm programSlug={program} />
                        </Suspense>
                    </div>
                </BaseForm>
            </Section>
        </Page>
    );
}
