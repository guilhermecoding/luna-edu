import Page from "@/components/page";
import Section from "@/components/section";
import { IconSchool, IconPlus, IconUserCheck, IconUserX } from "@tabler/icons-react";
import { Metadata } from "next";
import TitlePage from "@/components/title-page";
import { ButtonLink } from "@/components/ui/button-link";
import { DataTable } from "../_components/data-table";
import { getTeachers, getTeacherStats } from "@/services/users/teachers.service";
import { columns } from "./_components/columns";
import InfoBoxUsers from "../_components/info-box-users";

export const metadata: Metadata = {
    title: "Professores",
};

export default async function TeachersPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string }>;
}) {
    const { q } = await searchParams;
    const [teachersList, teacherStats] = await Promise.all([
        getTeachers(q),
        getTeacherStats(),
    ]);

    return (
        <Page>
            <Section>
                <div className="flex flex-row items-center gap-1 mb-3">
                    <IconSchool className="size-4 text-muted-foreground" />
                    <p className="text-muted-foreground font-bold">Professores</p>
                </div>
                <div className="flex flex-col lg:flex-row gap-y-6">
                    <div className="flex-1">
                        <TitlePage
                            title="Professores"
                            description="Gerencie os professores da sua instituição."
                        />
                    </div>
                    <div className="flex flex-1 justify-end items-end">
                        <ButtonLink className="w-full sm:w-auto" href="/admin/equipe/professores/novo">
                            <IconPlus className="size-4" />
                            Adicionar Professor
                        </ButtonLink>
                    </div>
                </div>
            </Section>

            <Section className="mt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <InfoBoxUsers
                    label="TOTAL"
                    value={teacherStats.totalTeachers}
                    color="indigo"
                    icon={<IconSchool className="size-full" />}
                />
                <InfoBoxUsers
                    label="ATIVOS"
                    value={teacherStats.activeTeachers}
                    color="emerald"
                    icon={<IconUserCheck className="size-full" />}
                />
                <InfoBoxUsers
                    label="INATIVOS"
                    value={teacherStats.inactiveTeachers}
                    color="amber"
                    icon={<IconUserX className="size-full" />}
                />
            </Section>

            <Section className="mt-8">
                <div className="bg-surface border border-surface-border p-6 rounded-3xl">
                    <DataTable
                        columns={columns}
                        data={teachersList}
                        title={
                            <h2 className="text-xl font-bold text-foreground">
                                Todos os professores
                            </h2>
                        }
                    />
                </div>
            </Section>
        </Page>
    );
}
