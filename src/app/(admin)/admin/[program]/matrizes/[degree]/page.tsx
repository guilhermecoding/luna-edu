import Page from "@/components/page";
import Section from "@/components/section";
import TitlePage from "@/components/title-page";
import { IconCirclePlusFilled } from "@tabler/icons-react";
import { ButtonLink } from "@/components/ui/button-link";
import { Metadata } from "next";
import { getDegreeBySlug } from "@/services/degrees/degrees.service";
import ListSubjects from "./_components/list-subjects";
import { Suspense } from "react";
import PageSkeleton from "@/components/skeletons/page-skeleton";

export const metadata: Metadata = {
    title: "Grade Curricular",
};

async function DegreeDashboardPageContent({
    params,
}: {
    params: Promise<{ program: string; degree: string }>;
}) {
    const { program: programSlug, degree: degreeSlug } = await params;
    const degreeData = await getDegreeBySlug(programSlug, degreeSlug);

    if (!degreeData) return null;

    return (
        <Page>
            <Section>
                <div className="flex flex-col lg:flex-row gap-y-6">
                    <div className="flex-1">
                        <TitlePage
                            title={`Grade: ${degreeData.name}`}
                            description={degreeData.description || "Gerencie as disciplinas teóricas vinculadas a esta matriz curricular."}
                        />
                        <div className="mt-4 flex flex-wrap gap-2 text-sm text-muted-foreground">
                            <span className="bg-secondary px-3 py-1 rounded-full text-foreground">{degreeData.slug}</span>
                            {degreeData.level && <span className="bg-foreground/5 px-2 py-1 rounded-md">{degreeData.level}</span>}
                            {degreeData.modality && <span className="bg-foreground/5 px-2 py-1 rounded-md">{degreeData.modality}</span>}
                            {degreeData.totalHours && <span className="bg-foreground/5 px-2 py-1 rounded-md">Carga Horária Total: {degreeData.totalHours}h</span>}
                        </div>
                    </div>
                    <div className="flex flex-1 justify-end items-end">
                        <ButtonLink className="w-full sm:w-auto" href={`/admin/${programSlug}/matrizes/${degreeSlug}/disciplinas/novo`}>
                            <IconCirclePlusFilled className="size-5" />
                            Adicionar Disciplina
                        </ButtonLink>
                    </div>
                </div>
            </Section>

            <Section className="mt-12">
                <ListSubjects programSlug={programSlug} degreeSlug={degreeSlug} degreeId={degreeData.id} />
            </Section>
        </Page>
    );
}

export default function DegreeDashboardPage({
    params,
}: PageProps<"/admin/[program]/matrizes/[degree]">) {

    return (
        <Suspense fallback={<PageSkeleton />}>
            <DegreeDashboardPageContent params={params} />
        </Suspense>
    );
}
