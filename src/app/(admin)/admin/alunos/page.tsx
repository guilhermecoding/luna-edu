import { IconSchool, IconChartBar, IconPlus, IconUserCircle } from "@tabler/icons-react";
import Page from "@/components/page";
import Section from "@/components/section";
import TitlePage from "@/components/title-page";
import { getStudentsList, getTotalStudentsCount } from "@/services/students/students.service";
import InfoBoxStudents from "./_components/info-box-students";
import { DataTable } from "./_components/data-table";
import { columns } from "./_components/columns";
import { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button-link";

export const metadata: Metadata = {
    title: "Alunos",
};

export default async function StudentsPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string }>;
}) {
    const { q } = await searchParams;

    const [totalStudents, studentsList] = await Promise.all([
        getTotalStudentsCount(),
        getStudentsList(q),
    ]);

    return (
        <Page>
            <Section>
                <div className="flex flex-row items-center gap-1 mb-3">
                    <IconSchool className="size-4 text-muted-foreground" />
                    <p className="text-muted-foreground font-bold">Alunos</p>
                </div>
                <div className="flex flex-col lg:flex-row gap-y-6">
                    <div className="flex-1">
                        <TitlePage
                            title="Alunos"
                            description="Gerencie todos os alunos matriculados na instituição."
                        />
                    </div>
                    <div className="flex flex-col sm:flex-row flex-1 gap-2 justify-end items-end">
                        <ButtonLink 
                            className="w-full sm:w-auto bg-transparent border-2 border-dashed border-primary hover:bg-primary text-primary hover:text-background hover:border-solid" 
                            href="/admin/alunos/indicadores"
                        >
                            <IconChartBar className="size-5" />
                            Indicadores
                        </ButtonLink>
                        <ButtonLink 
                            className="w-full sm:w-auto" 
                            href="/admin/alunos/novo"
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
                    <DataTable 
                        columns={columns} 
                        data={studentsList}
                        title={
                            <h2 className="text-xl flex flex-row items-center gap-2 font-bold text-foreground">
                                <IconSchool className="size-6" />
                                Todos os alunos
                            </h2>
                        }
                    />
                </div>
            </Section>
        </Page>
    );
}
