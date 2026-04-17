import Page from "@/components/page";
import Section from "@/components/section";
import TitlePage from "@/components/title-page";
import { IconCirclePlusFilled } from "@tabler/icons-react";
import { ButtonLink } from "@/components/ui/button-link";
import { Metadata } from "next";
import ListDegrees from "./_components/list-degrees";
import { getProgramBySlug } from "@/services/programs/programs.service";

export const metadata: Metadata = {
    title: "Matrizes Curriculares",
};

export default async function DegreesPage({
    params,
}: PageProps<"/admin/[program]/matrizes">) {
    const { program: programSlug } = await params;
    const program = await getProgramBySlug(programSlug);
    if (!program) return null; // Fallback de segurança silencioso

    return (
        <Page>
            <Section>
                <div className="flex flex-col lg:flex-row gap-y-6">
                    <div className="flex-1">
                        <TitlePage
                            title="Matrizes Curriculares"
                            description={`Gerencie os cursos formativos vinculados ao programa ${program.name}.`}
                        />
                    </div>
                    <div className="flex flex-1 justify-end items-end">
                        <ButtonLink className="w-full sm:w-auto" href={`/admin/${programSlug}/matrizes/novo`}>
                            <IconCirclePlusFilled className="size-5" />
                            Criar Matriz Curricular
                        </ButtonLink>
                    </div>
                </div>
            </Section>

            <Section className="mt-18">
                <ListDegrees programId={program.id} programSlug={programSlug} />
            </Section>
        </Page>
    );
}
