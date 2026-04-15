import type { Metadata } from "next";
import Page from "@/components/page";
import Section from "@/components/section";
import TitlePage from "@/components/title-page";
import { ButtonLink } from "@/components/ui/button-link";
import { IconCalendarPlus } from "@tabler/icons-react";
import CurrentPeriod from "./_components/current-period";
import ListOthersPeriods from "./_components/list-others-periods";
import { getPeriodsByProgramSlug } from "@/services/periods/periods.service";

export const metadata: Metadata = {
    title: "Períodos",
};

export default async function PeriodsPage({
    params,
}: PageProps<"/admin/[program]/periodos">) {
    const { program } = await params;

    const periods = getPeriodsByProgramSlug(program);

    return (
        <Page>
            <Section>
                <div className="flex flex-col lg:flex-row gap-y-6">
                    <div className="flex-1">
                        <TitlePage
                            title="Períodos"
                            description="Gerencie os períodos letivos do programa."
                        />
                    </div>
                    <div className="flex flex-1 justify-end items-end">
                        <ButtonLink href={`/admin/${program}/periodos/novo`} className="w-full sm:w-auto">
                            <IconCalendarPlus className="size-5" />
                            <span className="text-base mt-0.5">Adicionar Período</span>
                        </ButtonLink>
                    </div>
                </div>
            </Section>

            <Section className="mt-16">
                <CurrentPeriod periodsPromise={periods} programSlug={program} />
            </Section>

            <Section className="mt-16">
                <ListOthersPeriods periods={periods} programSlug={program} />
            </Section>
        </Page>
    );
}
