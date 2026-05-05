import { IconUsers, IconUserShield, IconBriefcase, IconShieldChevron } from "@tabler/icons-react";
import Page from "@/components/page";
import Section from "@/components/section";
import TitlePage from "@/components/title-page";
import { getUserStats, getUsersList } from "@/services/users/users.service";
import InfoBoxUsers from "./_components/info-box-users";
import { DataTable } from "./_components/data-table";
import { columns } from "./_components/columns";
import { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button-link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const metadata: Metadata = {
    title: "Equipe",
};

export default async function UsersPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string }>;
}) {
    const { q } = await searchParams;

    const [session, userStats, usersList] = await Promise.all([
        auth.api.getSession({ headers: await headers() }),
        getUserStats(),
        getUsersList(q),
    ]);
    const currentUserId = session?.user?.id ?? null;

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
                    <div className="flex flex-col sm:flex-row flex-1 gap-2 justify-end items-end">
                        <ButtonLink className="w-full sm:w-auto bg-transparent border-2 border-dashed border-primary hover:bg-primary text-primary hover:text-background hover:border-solid" href="/admin/equipe/administradores">
                            <IconUserShield className="size-5" />
                            Administradores
                        </ButtonLink>
                        <ButtonLink className="w-full sm:w-auto bg-transparent border-2 border-dashed border-primary hover:bg-primary text-primary hover:text-background hover:border-solid" href="/admin/equipe/professores">
                            <IconBriefcase className="size-5" />
                            Professores
                        </ButtonLink>
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
                    <DataTable 
                        columns={columns} 
                        data={usersList}
                        currentUserId={currentUserId}
                        title={
                            <h2 className="text-xl flex flex-row items-center gap-2 font-bold text-foreground">
                                <IconShieldChevron className="size-6" />
                                Todos os membros
                            </h2>
                        }
                    />
                </div>
            </Section>
        </Page>
    );
}
