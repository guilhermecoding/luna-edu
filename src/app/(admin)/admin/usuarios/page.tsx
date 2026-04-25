import { IconUsers, IconUserShield, IconSchool, IconBriefcase, IconPlus, IconShieldChevron } from "@tabler/icons-react";
import Page from "@/components/page";
import Section from "@/components/section";
import TitlePage from "@/components/title-page";
import { getUserStats, getUsersList } from "@/services/users/users.service";
import { getTotalStudentsCount } from "@/services/students/students.service";
import InfoBoxUsers from "./_components/info-box-users";
import { DataTable } from "./_components/data-table";
import { columns } from "./_components/columns";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
    title: "Usuários",
};

export default async function UsersPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string }>;
}) {
    const { q } = await searchParams;

    const [userStats, totalStudents, usersList] = await Promise.all([
        getUserStats(),
        getTotalStudentsCount(),
        getUsersList(q),
    ]);

    return (
        <Page>
            <Section>
                <div className="flex flex-row items-center gap-1 mb-3">
                    <IconUsers className="size-4 text-muted-foreground" />
                    <p className="text-muted-foreground font-bold">Usuários</p>
                </div>
                <div className="flex flex-col lg:flex-row gap-y-6">
                    <div className="flex-1">
                        <TitlePage
                            title="Usuários do Sistema"
                            description="Gerencie todos os usuários da sua instituição."
                        />
                    </div>
                </div>
            </Section>

            <Section className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <InfoBoxUsers
                    label="TOTAL DE USUÁRIOS"
                    value={userStats.totalUsers}
                    color="indigo"
                    icon={<IconUsers className="size-full" />}
                />
                <InfoBoxUsers
                    label="ALUNOS"
                    value={totalStudents}
                    color="emerald"
                    icon={<IconSchool className="size-full" />}
                />
                <InfoBoxUsers
                    label="ADMINISTRADORES"
                    value={userStats.totalAdmins}
                    color="rose"
                    icon={<IconUserShield className="size-full" />}
                />
                <InfoBoxUsers
                    label="PROFESSORES"
                    value={userStats.totalTeachers}
                    color="amber"
                    icon={<IconBriefcase className="size-full" />}
                />
            </Section>

            <Section className="mt-8">
                <div className="bg-surface border border-surface-border p-6 rounded-3xl">
                    <div className="flex flex-row items-center justify-between">
                        <h2 className="text-xl flex flex-row items-start sm:items-center gap-2 font-bold text-foreground mb-6">
                            <IconShieldChevron className="size-6" />
                            Administradores e Professores
                        </h2>
                        <Button variant="outline">
                            <IconPlus className="size-4" />
                            Adicionar Usuário
                        </Button>
                    </div>
                    <DataTable columns={columns} data={usersList} />
                </div>
            </Section>
        </Page>
    );
}
