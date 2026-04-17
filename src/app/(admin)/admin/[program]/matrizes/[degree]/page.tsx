import Page from "@/components/page";
import Section from "@/components/section";
import TitlePage from "@/components/title-page";
import { IconBlocks, IconCirclePlusFilled } from "@tabler/icons-react";
import { ButtonLink } from "@/components/ui/button-link";
import { Metadata } from "next";
import { getDegreeBySlug } from "@/services/degrees/degrees.service";
import ListSubjects from "./_components/list-subjects";
import { Suspense } from "react";
import PageSkeleton from "@/components/skeletons/page-skeleton";
import InfoBox from "./_components/info-box";

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
                <div className="flex flex-row items-center gap-1 mb-3">
                    <IconBlocks className="size-4 text-muted-foreground" />
                    <p className="text-muted-foreground font-bold">Grade Curricular</p>
                </div>
                <div className="flex flex-col lg:flex-row gap-y-6">
                    <div className="flex-1">
                        <TitlePage
                            title={`${degreeData.name}`}
                            description={degreeData.description || "Gerencie as disciplinas teóricas vinculadas a esta matriz curricular."}
                        />
                        <div className="mt-4 flex flex-wrap gap-2 text-sm text-muted-foreground">
                            <span className="bg-secondary px-3 py-1 rounded-full text-foreground">{degreeData.slug}</span>
                        </div>
                    </div>
                    <div className="flex flex-1 justify-end items-center">
                        <ButtonLink className="w-full sm:w-auto" href={`/admin/${programSlug}/matrizes/${degreeSlug}/disciplinas/novo`}>
                            <IconCirclePlusFilled className="size-5" />
                            Adicionar Disciplina
                        </ButtonLink>
                    </div>
                </div>
            </Section>

            <Section className="w-full mt-18 sm:mt-6 flex flex-col sm:flex-row justify-between gap-6">
                <InfoBox
                    label="CARGA HORÁRIA TOTAL"
                    value={`${degreeData.totalHours}h`}
                    color="indigo"
                />
                <InfoBox
                    label="TOTAL DE DISCIPLINAS"
                    value={degreeData._count.subjects}
                    color="green"
                />
                <InfoBox
                    label="MODALIDADE"
                    value={degreeData.modality!}
                    color="rose"
                />
            </Section>

            <Section className="mt-18">
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
