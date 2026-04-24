import Page from "@/components/page";
import Section from "@/components/section";
import TitlePage from "@/components/title-page";
import { IconCirclePlusFilled, IconCalendarEvent } from "@tabler/icons-react";
import { ButtonLink } from "@/components/ui/button-link";
import { Metadata } from "next";
import { getPeriodByProgramAndSlug } from "@/services/periods/periods.service";
import { notFound } from "next/navigation";
import ListSubPeriods from "./_components/list-sub-periods";

export const metadata: Metadata = {
    title: "Etapas Avaliativas",
};

export default async function SubPeriodsPage({
    params,
}: {
    params: Promise<{ program: string; period: string }>;
}) {
    const { program, period } = await params;
    const periodData = await getPeriodByProgramAndSlug(program, period);

    if (!periodData) {
        notFound();
    }

    return (
        <Page>
            <Section>
                <div className="flex flex-row items-center gap-1 mb-3">
                    <IconCalendarEvent className="size-4 text-muted-foreground" />
                    <p className="text-muted-foreground font-bold">Etapas Avaliativas</p>
                </div>
                <div className="flex flex-col lg:flex-row gap-y-6">
                    <div className="flex-1">
                        <TitlePage
                            title={periodData.name}
                            description="Gerencie os bimestres ou trimestres deste período letivo."
                        />
                    </div>
                    <div className="flex flex-1 justify-end items-end">
                        <ButtonLink className="w-full sm:w-auto" href={`/admin/${program}/periodos/${period}/etapas/novo`}>
                            <IconCirclePlusFilled className="size-5" />
                            Adicionar Etapa
                        </ButtonLink>
                    </div>
                </div>
            </Section>

            <Section className="mt-18">
                <ListSubPeriods periodId={periodData.id} programSlug={program} periodSlug={period} />
            </Section>
        </Page>
    );
}
