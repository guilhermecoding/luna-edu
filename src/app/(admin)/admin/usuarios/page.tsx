import { IconUsers, IconUserShield, IconSchool, IconBriefcase } from "@tabler/icons-react";
import Page from "@/components/page";
import Section from "@/components/section";
import TitlePage from "@/components/title-page";
import React from "react";
import { getUserStats } from "@/services/users/users.service";
import { getTotalStudentsCount } from "@/services/students/students.service";
import InfoBoxUsers from "./_components/info-box-users";

export default async function UsersPage() {
    const [userStats, totalStudents] = await Promise.all([
        getUserStats(),
        getTotalStudentsCount(),
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
        </Page>
    );
}
