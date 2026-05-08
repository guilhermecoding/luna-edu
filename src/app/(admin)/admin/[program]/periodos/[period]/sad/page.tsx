import Page from "@/components/page";
import Section from "@/components/section";
import TitlePage from "@/components/title-page";
import { getPeriodByProgramAndSlug } from "@/services/periods/periods.service";
import { getSADAccessList } from "@/services/students/students.service";
import { notFound } from "next/navigation";
import { SADAccessTable } from "./_components/sad-access-table";
import { IconDeviceAnalytics } from "@tabler/icons-react";

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

    const students = await getSADAccessList(period.id, filter);

    return (
        <Page>
            <Section>
                <div className="flex flex-row items-center gap-1 mb-3">
                    <IconDeviceAnalytics className="size-4 text-muted-foreground" />
                    <p className="text-muted-foreground font-bold">Monitoramento SAD</p>
                </div>
                <TitlePage
                    title="Acessos ao Portal"
                    description={`Monitore quem já visualizou o resultado no ciclo ${period.name}.`}
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
