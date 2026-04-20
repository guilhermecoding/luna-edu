import BaseForm from "@/components/base-form";
import Page from "@/components/page";
import Section from "@/components/section";
import { getProgramBySlug } from "@/services/programs/programs.service";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EditProgramForm } from "./_components/edit-program-form";
import SkeletonForm from "../../../../../../components/skeletons/skeleton-form";
import { Suspense } from "react";


export const metadata: Metadata = {
    title: "Editar Programa",
};

async function EditProgramPageContent({ params }: Omit<PageProps<"/admin/programas/[slug]/editar">, "searchParams">) {
    const { slug } = await params;
    const program = await getProgramBySlug(slug);

    if (!program) {
        notFound();
    }

    return (
        <Page>
            <Section>
                <BaseForm title="Editar Programa" description="Atualize os dados do programa">
                    <div className="mt-6">
                        <Suspense fallback={<SkeletonForm />}>
                            <EditProgramForm
                                slug={program.slug}
                                name={program.name}
                                description={program.description ?? ""}
                            />
                        </Suspense>
                    </div>
                </BaseForm>
            </Section>
        </Page>
    );
}

// @COMPONENTE PRINCIPAL
export default function EditProgramPage({ params }: PageProps<"/admin/programas/[slug]/editar">) {
    return (
        <Suspense fallback={null}>
            <EditProgramPageContent params={params} />
        </Suspense>
    );
}
