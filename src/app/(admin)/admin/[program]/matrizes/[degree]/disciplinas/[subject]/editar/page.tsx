import BaseForm from "@/components/base-form";
import Page from "@/components/page";
import Section from "@/components/section";
import { Suspense } from "react";
import { EditSubjectForm } from "./_components/edit-subject-form";
import { Metadata } from "next";
import { getSubjectById } from "@/services/subjects/subjects.service";
import { notFound } from "next/navigation";
import { getDegreeBySlug } from "@/services/degrees/degrees.service";

export const metadata: Metadata = {
    title: "Editar Disciplina",
};

export default async function EditSubjectPage({
    params,
}: PageProps<"/admin/[program]/matrizes/[degree]/disciplinas/[subject]/editar">) {
    const { program, degree, subject } = await params;
    
    // Validar se dados existem
    const subjectData = await getSubjectById(subject);
    const degreeData = await getDegreeBySlug(degree);

    if (!subjectData || !degreeData) {
        return notFound();
    }

    return (
        <Page>
            <Section>
                <BaseForm
                    title="Editar Disciplina"
                    description={`Editando a matéria: ${subjectData.name} (${degreeData.name})`}
                >
                    <div className="mt-6">
                        <Suspense fallback={null}>
                            <EditSubjectForm 
                                programSlug={program}
                                degreeSlug={degreeData.slug}
                                degreeId={degreeData.id}
                                subjectId={subjectData.id}
                                initialData={subjectData} 
                            />
                        </Suspense>
                    </div>
                </BaseForm>
            </Section>
        </Page>
    );
}
