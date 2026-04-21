import Page from "@/components/page";
import Section from "@/components/section";
import TitlePage from "@/components/title-page";
import { IconBooks, IconChevronLeft } from "@tabler/icons-react";
import { ButtonLink } from "@/components/ui/button-link";
import { Metadata } from "next";
import { getPeriodByProgramAndSlug } from "@/services/periods/periods.service";
import { getClassGroupByPeriodIdAndSlug } from "@/services/class-groups/class-groups.service";
import { notFound } from "next/navigation";
import ListDisciplines from "../../_components/list-disciplines";

export const metadata: Metadata = {
    title: "Disciplinas da Turma",
};

export default async function TurmaDisciplinasPage({
    params,
}: {
    params: Promise<{ program: string; period: string; turma: string }>;
}) {
    const { program, period, turma } = await params;

    const periodData = await getPeriodByProgramAndSlug(program, period);
    if (!periodData) notFound();

    const classGroup = await getClassGroupByPeriodIdAndSlug(periodData.id, turma);
    if (!classGroup) notFound();

    return (
        <Page>
            <Section>
                <div className="mb-6">
                    <ButtonLink
                        href={`/admin/${program}/periodos/${period}/turmas`}
                        variant="ghost"
                        size="sm"
                        className="-ml-2 text-muted-foreground hover:text-foreground"
                    >
                        <IconChevronLeft className="size-4" />
                        Voltar para Turmas
                    </ButtonLink>
                </div>

                <div className="flex flex-row items-center gap-1 mb-3">
                    <IconBooks className="size-4 text-muted-foreground" />
                    <p className="text-muted-foreground font-bold">Disciplinas Ofertadas</p>
                </div>

                <TitlePage
                    title={classGroup.name}
                    description={`${classGroup.degree.name} • ${classGroup.basePeriod}ª Série • ${classGroup.shift === "MORNING" ? "Manhã" : classGroup.shift === "AFTERNOON" ? "Tarde" : "Noite"}`}
                />
            </Section>

            <Section className="mt-12">
                <ListDisciplines
                    courses={classGroup.courses}
                    programSlug={program}
                    periodSlug={period}
                />
            </Section>
        </Page>
    );
}
