import Page from "@/components/page";
import Section from "@/components/section";
import TitlePage from "@/components/title-page";
import { ButtonLink } from "@/components/ui/button-link";
import { getPeriodByProgramAndSlug } from "@/services/periods/periods.service";
import { IconCirclePlusFilled, IconSchool } from "@tabler/icons-react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import ListClassGroups from "./_components/list-class-groups";

export const metadata: Metadata = {
    title: "Gerenciar Classes",
};

export default async function ClassGroupsPage({
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
                    <IconSchool className="size-4 text-muted-foreground" />
                    <p className="text-muted-foreground font-bold">Turmas</p>
                </div>
                <div className="flex flex-col lg:flex-row gap-y-6">
                    <div className="flex-1">
                        <TitlePage
                            title={`Turmas do ${periodData.name}`}
                            description="Gerencie as turmas deste período letivo."
                        />
                    </div>
                    <div className="flex flex-1 justify-end items-end">
                        <ButtonLink className="w-full sm:w-auto" href={`/admin/${program}/periodos/${period}/turmas/novo`}>
                            <IconCirclePlusFilled className="size-5" />
                            Criar Turma
                        </ButtonLink>
                    </div>
                </div>
            </Section>

            <Section className="mt-18">
                <ListClassGroups periodId={periodData.id} programSlug={program} periodSlug={period} />
            </Section>
        </Page>
    );
}
