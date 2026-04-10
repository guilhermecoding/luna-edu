import BaseForm from "@/components/base-form";
import Page from "@/components/page";
import Section from "@/components/section";
import { getProgramBySlug } from "@/services/programs/programs.service";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EditProgramForm } from "./_components/form";

type EditProgramPageProps = {
    params: Promise<{
        slug: string;
    }>;
};

export const metadata: Metadata = {
    title: "Editar Programa",
};

export default async function EditProgramPage({ params }: EditProgramPageProps) {
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
                        <EditProgramForm
                            slug={program.slug}
                            name={program.name}
                            description={program.description ?? ""}
                        />
                    </div>
                </BaseForm>
            </Section>
        </Page>
    );
}
