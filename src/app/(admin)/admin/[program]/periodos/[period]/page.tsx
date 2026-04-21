import Page from "@/components/page";
import Section from "@/components/section";
import TitlePage from "@/components/title-page";
import { IconCalendarFilled, IconUsersGroup, IconLayoutGrid, IconCalendarEvent } from "@tabler/icons-react";
import { ButtonLink } from "@/components/ui/button-link";
import { getPeriodByProgramAndSlug } from "@/services/periods/periods.service";
import { getSubPeriodsByPeriodId } from "@/services/sub-periods/sub-periods.service";
import { getClassGroupsByPeriodId } from "@/services/class-groups/class-groups.service";
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

    const [subPeriods, classGroups] = await Promise.all([
        getSubPeriodsByPeriodId(periodData.id),
        getClassGroupsByPeriodId(periodData.id),
    ]);

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

            {/* Cards de navegação rápida */}
            <Section className="mt-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Sub-períodos (Bimestres) */}
                    <div className="border border-surface-border rounded-2xl bg-surface p-6 flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <div className="flex justify-center items-center bg-amber-100 dark:bg-amber-900/30 size-10 rounded-xl text-amber-600 dark:text-amber-400 shrink-0">
                                <IconCalendarEvent className="size-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">Etapas Avaliativas</h3>
                                <p className="text-xs text-muted-foreground">Bimestres / Trimestres</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between mt-auto">
                            <span className="text-2xl font-bold">{subPeriods.length}</span>
                            <ButtonLink
                                href={`/admin/${program}/periodos/${period}/etapas`}
                                variant="outline"
                                className="text-xs"
                            >
                                Gerenciar
                            </ButtonLink>
                        </div>
                    </div>

                    {/* Grupos (Turmas Físicas) */}
                    <div className="border border-surface-border rounded-2xl bg-surface p-6 flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <div className="flex justify-center items-center bg-blue-100 dark:bg-blue-900/30 size-10 rounded-xl text-blue-600 dark:text-blue-400 shrink-0">
                                <IconLayoutGrid className="size-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">Turmas Físicas</h3>
                                <p className="text-xs text-muted-foreground">Grupos de alunos</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between mt-auto">
                            <span className="text-2xl font-bold">{classGroups.length}</span>
                            <ButtonLink
                                href={`/admin/${program}/periodos/${period}/grupos`}
                                variant="outline"
                                className="text-xs"
                            >
                                Gerenciar
                            </ButtonLink>
                        </div>
                    </div>

                    {/* Turmas Disciplinares */}
                    <div className="border border-surface-border rounded-2xl bg-surface p-6 flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <div className="flex justify-center items-center bg-primary/10 size-10 rounded-xl text-primary shrink-0">
                                <IconUsersGroup className="size-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">Turmas Disciplinares</h3>
                                <p className="text-xs text-muted-foreground">Ofertas de disciplinas</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between mt-auto">
                            <ButtonLink
                                href={`/admin/${program}/periodos/${period}/turmas`}
                                variant="outline"
                                className="text-xs"
                            >
                                Gerenciar
                            </ButtonLink>
                        </div>
                    </div>
                </div>
            </Section>
        </Page>
    );
}
