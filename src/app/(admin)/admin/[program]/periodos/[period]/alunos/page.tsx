import { IconSchool, IconChartBar, IconPlus, IconUserCircle, IconArrowLeft } from "@tabler/icons-react";
import Page from "@/components/page";
import Section from "@/components/section";
import TitlePage from "@/components/title-page";
import { getStudentsByPeriodList, getTotalStudentsCountByPeriodId } from "@/services/students/students.service";
import { getPeriodByProgramAndSlug } from "@/services/periods/periods.service";
import InfoBoxStudents from "@/app/(admin)/admin/alunos/_components/info-box-students";
import { DataTablePeriodStudents } from "./_components/data-table-period-students";
import { columns } from "./_components/columns-period";
import { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button-link";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
    title: "Alunos do Período",
};

export default async function PeriodStudentsPage({
    params,
    searchParams,
}: {
    params: Promise<{ program: string; period: string }>;
    searchParams: Promise<{ q?: string }>;
}) {
    const { program, period } = await params;
    const { q } = await searchParams;

    const periodData = await getPeriodByProgramAndSlug(program, period);

    if (!periodData) {
        notFound();
    }

    const [totalStudents, studentsList] = await Promise.all([
        getTotalStudentsCountByPeriodId(periodData.id),
        getStudentsByPeriodList(periodData.id, q),
    ]);

    return (
        <Page>
            <Section>
                <div className="flex flex-row items-center gap-1 mb-3">
                    <IconSchool className="size-4 text-muted-foreground" />
                    <p className="text-muted-foreground font-bold">Alunos do Período</p>
                </div>
                <div className="flex flex-col lg:flex-row gap-y-6">
                    <div className="flex-1">
                        <TitlePage
                            title={`Alunos - ${periodData.name}`}
                            description="Gerencie todos os alunos matriculados ou em espera neste período. Você pode selecionar alunos para desvinculá-los."
                        />
                    </div>
                    <div className="flex flex-col sm:flex-row flex-1 gap-2 justify-end items-end">
                        <ButtonLink
                            className="w-full sm:w-auto bg-transparent border-2 border-dashed border-primary hover:bg-primary text-primary hover:text-background hover:border-solid h-11"
                            href={`/admin/${program}/periodos/${period}/alunos/indicadores`}
                        >
                            <IconChartBar className="size-5 mr-1" />
                            Indicadores
                        </ButtonLink>
                        <ButtonLink
                            className="w-full sm:w-auto h-11"
                            href={`/admin/alunos/novo?periodId=${periodData.id}&redirect=/admin/${program}/periodos/${period}/alunos`}
                        >
                            <IconPlus className="size-5 mr-1" />
                            Novo Aluno
                        </ButtonLink>
                    </div>
                </div>
            </Section>

            <Section className="mt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <InfoBoxStudents
                    label="TOTAL DE ALUNOS"
                    value={totalStudents}
                    color="sky"
                    icon={<IconUserCircle className="size-full" />}
                    className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-1"
                />
            </Section>

            <Section className="mt-8">
                <div className="bg-surface border border-surface-border p-6 rounded-3xl">
                    <DataTablePeriodStudents
                        columns={columns}
                        data={studentsList}
                        periodId={periodData.id}
                        title={
                            <h2 className="text-xl flex flex-row items-center gap-2 font-bold text-foreground">
                                <IconSchool className="size-6" />
                                Alunos vinculados
                            </h2>
                        }
                    />
                </div>
            </Section>
        </Page>
    );
}
