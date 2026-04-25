import { IconUsers, IconUserShield, IconBriefcase, IconPlus, IconShieldChevron } from "@tabler/icons-react";
import Page from "@/components/page";
import Section from "@/components/section";
import TitlePage from "@/components/title-page";
import { getUserStats, getUsersList } from "@/services/users/users.service";
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

    const [userStats, usersList] = await Promise.all([
        getUserStats(),
        getUsersList(q),
    ]);

    return (
        <Page>
            <Section>
                <div className="flex flex-row items-center gap-1 mb-3">
                    <IconUsers className="size-4 text-muted-foreground" />
                    <p className="text-muted-foreground font-bold">Equipe</p>
                </div>
                <div className="flex flex-col lg:flex-row gap-y-6">
                    <div className="flex-1">
                        <TitlePage
                            title="Membros da Equipe"
                            description="Gerencie todos os membros da equipe da sua instituição."
                        />
                    </div>
                </div>
            </Section>

            <Section className="mt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <InfoBoxUsers
                    label="TOTAL DE MEMBROS"
                    value={userStats.totalUsers}
                    color="emerald"
                    icon={<IconUsers className="size-full" />}
                    className="col-span-1 sm:col-span-2 md:col-span-1"
                />
                <InfoBoxUsers
                    label="ADMINISTRADORES"
                    value={userStats.totalAdmins}
                    color="rose"
                    icon={<IconUserShield className="size-full" />}
                    href="/admin/equipe/administradores"
                    labelLink="Todos os administradores"
                />
                <InfoBoxUsers
                    label="PROFESSORES"
                    value={userStats.totalTeachers}
                    color="amber"
                    icon={<IconBriefcase className="size-full" />}
                    href="/admin/equipe/professores"
                    labelLink="Todos os professores"
                />
            </Section>

            <Section className="mt-8">
                <div className="bg-surface border border-surface-border p-6 rounded-3xl">
                    <div className="flex flex-col mb-8 sm:flex-row items-start sm:items-center justify-between">
                        <h2 className="text-xl flex flex-row items-start sm:items-center gap-2 font-bold text-foreground mb-6 w-full">
                            <IconShieldChevron className="size-6" />
                            Administradores e Professores
                        </h2>
                        <Button className="w-full sm:w-auto" variant="outline">
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
