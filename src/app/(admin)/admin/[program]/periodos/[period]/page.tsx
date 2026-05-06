import Page from "@/components/page";
import Section from "@/components/section";
import TitlePage from "@/components/title-page";
import { IconCalendarFilled, IconSchool, IconCircleCheck, IconUsers, IconProgress, IconPencil } from "@tabler/icons-react";
import { ButtonLink } from "@/components/ui/button-link";
import { getPeriodByProgramAndSlug, getPeriodStats } from "@/services/periods/periods.service";
import { getSubPeriodsByPeriodId } from "@/services/sub-periods/sub-periods.service";
import { getClassGroupsByPeriodId } from "@/services/class-groups/class-groups.service";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import InfoBoxPeriod from "luna-edu/src/app/(admin)/admin/[program]/periodos/[period]/_components/info-box-period";
import ClassGroupsPreview from "./_components/class-groups-preview";
import SubPeriodsPreview from "./_components/sub-periods-preview";

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

    const [subPeriods, classGroups, stats] = await Promise.all([
        getSubPeriodsByPeriodId(periodData.id),
        getClassGroupsByPeriodId(periodData.id),
        getPeriodStats(periodData.id),
    ]);
    const previewSubPeriods = subPeriods.slice(0, 5);
    const previewClassGroups = classGroups.slice(0, 5);

    const isActive = !periodData.completedAt;

    return (
        <Page>
            <Section>
                <div className="flex flex-row items-center gap-1 mb-3">
                    <IconCalendarFilled className="size-4 text-muted-foreground" />
                    <p className="text-muted-foreground font-bold">Período Letivo</p>
                </div>
                <div className="flex flex-col lg:flex-row gap-y-6 justify-between">
                    <div className="flex-1">
                        <TitlePage
                            title={periodData.name}
                            description={`De ${new Date(periodData.startDate).toLocaleDateString("pt-BR")} à ${new Date(periodData.endDate).toLocaleDateString("pt-BR")}`}
                        />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 items-start lg:items-end lg:justify-end">
                        <ButtonLink className="w-full sm:w-auto bg-transparent border-2 border-dashed border-primary hover:bg-primary text-primary hover:text-background hover:border-solid h-11" href={`/admin/${program}/periodos/${period}/alunos`}>
                            <IconSchool className="size-5 mr-2" />
                            Alunos
                        </ButtonLink>
                        <ButtonLink className="w-full sm:w-auto bg-transparent border-2 border-dashed border-primary hover:bg-primary text-primary hover:text-background hover:border-solid h-11" href={`/admin/${program}/periodos/${period}/editar`}>
                            <IconPencil className="size-5 mr-2" />
                            Editar Período
                        </ButtonLink>
                    </div>
                </div>
            </Section>

            <Section className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <InfoBoxPeriod
                    label="TOTAL DE ALUNOS"
                    value={stats.totalStudents}
                    color="indigo"
                    icon={<IconUsers className="size-full" />}
                />
                <InfoBoxPeriod
                    label="ALUNOS MATRICULADOS"
                    value={stats.enrolledStudents}
                    color="emerald"
                    icon={<IconCircleCheck className="size-full" />}
                />
                <InfoBoxPeriod
                    label="TOTAL DE TURMAS"
                    value={classGroups.length}
                    color="amber"
                    icon={<IconSchool className="size-full" />}
                />
                <InfoBoxPeriod
                    label="STATUS"
                    value={isActive ? "ATIVO" : "FINALIZADO"}
                    color="purple"
                    icon={<IconProgress className="size-full" />}
                />
            </Section>

            {/* Visualização de parte das turmas */}
            <Section className="mt-12">
                <ClassGroupsPreview
                    classGroups={previewClassGroups}
                    totalClassGroups={classGroups.length}
                    programSlug={program}
                    periodSlug={period}
                />
            </Section>

            {/* Visualização de parte das etapas */}
            <Section className="mt-12">
                <SubPeriodsPreview
                    subPeriods={previewSubPeriods}
                    totalSubPeriods={subPeriods.length}
                    programSlug={program}
                    periodSlug={period}
                />
            </Section>
        </Page>
    );
}
