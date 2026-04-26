import Page from "@/components/page";
import Section from "@/components/section";
import { IconUserShield, IconPlus } from "@tabler/icons-react";
import { Metadata } from "next";
import TitlePage from "@/components/title-page";
import { ButtonLink } from "@/components/ui/button-link";
import { DataTable } from "../_components/data-table";
import { getAdmins } from "@/services/users/admins.service";
import { columns } from "./_components/columns";

export const metadata: Metadata = {
    title: "Administradores",
};

export default async function AdministratorsPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string }>;
}) {
    const { q } = await searchParams;
    const adminsList = await getAdmins(q);

    return (
        <Page>
            <Section>
                <div className="flex flex-row items-center gap-1 mb-3">
                    <IconUserShield className="size-4 text-muted-foreground" />
                    <p className="text-muted-foreground font-bold">Equipe / Administradores</p>
                </div>
                <div className="flex flex-col lg:flex-row gap-y-6">
                    <div className="flex-1">
                        <TitlePage
                            title="Administradores"
                            description="Gerencie os administradores com acesso ao sistema da sua instituição."
                        />
                    </div>
                </div>
            </Section>

            <Section className="mt-8">
                <div className="bg-surface border border-surface-border p-6 rounded-3xl">
                    <div className="flex flex-col mb-8 sm:flex-row items-start sm:items-center justify-between">
                        <h2 className="text-xl flex flex-row items-start sm:items-center gap-2 font-bold text-foreground mb-6 sm:mb-0 w-full">
                            Todos os administradores
                        </h2>
                        <ButtonLink className="w-full sm:w-auto" href="/admin/equipe/administradores/novo">
                            <IconPlus className="size-4" />
                            Adicionar Administrador
                        </ButtonLink>
                    </div>
                    <DataTable columns={columns} data={adminsList} />
                </div>
            </Section>
        </Page>
    );
}
