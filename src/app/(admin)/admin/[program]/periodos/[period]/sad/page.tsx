import Page from "@/components/page";
import Section from "@/components/section";
import TitlePage from "@/components/title-page";
import { getPeriodByProgramAndSlug } from "@/services/periods/periods.service";
import { getSADAccessList } from "@/services/students/students.service";
import { notFound } from "next/navigation";
import { SADAccessTable } from "./_components/sad-access-table";
import { IconReportSearch, IconUsers, IconCheck, IconClock } from "@tabler/icons-react";
import InfoBoxPeriod from "../_components/info-box-period";

interface SADPageProps {
    params: Promise<{
        program: string;
        period: string;
    }>;
    searchParams: Promise<{
        filter?: "VIEWED" | "NOT_VIEWED";
    }>;
}

export default async function SADPage({ params, searchParams }: SADPageProps) {
    const { program, period: periodSlug } = await params;
    const { filter } = await searchParams;

    const period = await getPeriodByProgramAndSlug(program, periodSlug);

    if (!period) {
        notFound();
    }

    const allStudents = await getSADAccessList(period.id);
    const students = filter ? await getSADAccessList(period.id, filter) : allStudents;

    const totalStudents = allStudents.length;
    const viewedCount = allStudents.filter(s => s.accessedAt !== null).length;
    const notViewedCount = totalStudents - viewedCount;

    return (
        <Page>
            <Section>
                <div className="flex flex-row items-start sm:items-center gap-1 mb-3">
                    <IconReportSearch className="size-4 mt-1 sm:mt-0 text-muted-foreground" />
                    <p className="text-muted-foreground font-bold">SAD (Synchronized Access to Data)</p>
                </div>
                <TitlePage
                    title="Acessos ao Portal"
                    description={`Monitore quem já visualizou o resultado no ciclo ${period.name}.`}
                />
            </Section>

            <Section className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <InfoBoxPeriod
                    label="TOTAL DE ALUNOS"
                    value={totalStudents}
                    color="indigo"
                    icon={<IconUsers className="size-full" />}
                />
                <InfoBoxPeriod
                    label="VISUALIZARAM"
                    value={viewedCount}
                    color="emerald"
                    icon={<IconCheck className="size-full" />}
                />
                <InfoBoxPeriod
                    label="NÃO VISUALIZARAM"
                    value={notViewedCount}
                    color="amber"
                    icon={<IconClock className="size-full" />}
                />
            </Section>

            <Section className="mt-8">
                <SADAccessTable
                    data={students}
                    currentFilter={filter}
                />
            </Section>
        </Page>
    );
}

