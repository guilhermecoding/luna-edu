import { Suspense } from "react";
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

    const periodsPromise = getPeriodsByProgramSlug(program);

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
                <Suspense fallback={<div className="h-64 rounded-4xl border animate-pulse" />}>
                    <CurrentPeriod periodsPromise={periodsPromise} programSlug={program} />
                </Suspense>
            </Section>

            <Section className="mt-16">
                <Suspense fallback={<div className="h-40 rounded-4xl border animate-pulse" />}>
                    <ListOthersPeriods periodsPromise={periodsPromise} programSlug={program} />
                </Suspense>
            </Section>
        </Page>
    );
}
