import BaseForm from "@/components/base-form";
import Page from "@/components/page";
import Section from "@/components/section";
import { Suspense } from "react";
import { EditDegreeForm } from "./_components/edit-degree-form";
import { Metadata } from "next";
import { getDegreeBySlug } from "@/services/degrees/degrees.service";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
    title: "Editar Matriz Curricular",
};

export default async function EditDegreePage({
    params,
}: PageProps<"/admin/[program]/matrizes/[degree]/editar">) {
    const { program, degree } = await params;
    const degreeData = await getDegreeBySlug(degree);

    if (!degreeData) {
        return notFound();
    }

    return (
        <Page>
            <Section>
                <BaseForm
                    title="Editar Matriz Curricular"
                    description={`Atualizando dados da matriz: ${degreeData.name}`}
                >
                    <div className="mt-6">
                        <Suspense fallback={null}>
                            <EditDegreeForm 
                                programSlug={program} 
                                degreeId={degreeData.id}
                                degreeSlug={degreeData.slug}
                                initialData={degreeData} 
                            />
                        </Suspense>
                    </div>
                </BaseForm>
            </Section>
        </Page>
    );
}
