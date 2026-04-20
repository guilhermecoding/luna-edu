import Page from "@/components/page";
import Section from "@/components/section";
import TitlePage from "@/components/title-page";
import { IconCalendarFilled, IconUsersGroup } from "@tabler/icons-react";
import { ButtonLink } from "@/components/ui/button-link";
import { getPeriodByProgramAndSlug } from "@/services/periods/periods.service";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Período Letivo",
};

export default async function PeriodPage({
    params,
}: {
    params: Promise<{ program: string; period: string }>;
}) {
    const { program, period } = await params;
    const periodData = await getPeriodByProgramAndSlug(program, period);

    if (!periodData) {
        notFound();
    }

    const isActive = !periodData.completedAt;

    return (
        <Page>
            <Section>
                <div className="flex flex-row items-center gap-1 mb-3">
                    <IconCalendarFilled className="size-4 text-muted-foreground" />
                    <p className="text-muted-foreground font-bold">Período Letivo</p>
                </div>
                <div className="flex flex-col lg:flex-row gap-y-6">
                    <div className="flex-1">
                        <TitlePage
                            title={periodData.name}
                            description={`${new Date(periodData.startDate).toLocaleDateString("pt-BR")} — ${new Date(periodData.endDate).toLocaleDateString("pt-BR")}`}
                        />
                        <div className="mt-3">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${isActive ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-muted text-muted-foreground"}`}>
                                {isActive ? "Ativo" : "Finalizado"}
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-1 justify-end items-end">
                        <ButtonLink className="w-full sm:w-auto" href={`/admin/${program}/periodos/${period}/turmas`}>
                            <IconUsersGroup className="size-5" />
                            Gerenciar Turmas
                        </ButtonLink>
                    </div>
                </div>
            </Section>
        </Page>
    );
}
