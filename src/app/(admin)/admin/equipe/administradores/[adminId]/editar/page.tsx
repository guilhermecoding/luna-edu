import Page from "@/components/page";
import Section from "@/components/section";
import TitlePage from "@/components/title-page";
import { IconArrowLeft } from "@tabler/icons-react";
import { ButtonLink } from "@/components/ui/button-link";
import { Metadata } from "next";
import { getAdminById } from "@/services/users/admins.service";
import { notFound } from "next/navigation";
import EditAdminForm from "./_components/edit-admin-form";

export const metadata: Metadata = {
    title: "Editar Administrador",
};

export default async function EditAdminPage({
    params,
}: {
    params: Promise<{ adminId: string }>;
}) {
    const { adminId } = await params;
    const admin = await getAdminById(adminId);

    if (!admin) {
        notFound();
    }

    return (
        <Page>
            <Section>
                <div className="flex flex-row items-center gap-1 mb-3">
                    <ButtonLink href="/admin/equipe/administradores" variant="ghost" size="sm" className="-ml-3 text-muted-foreground hover:text-foreground">
                        <IconArrowLeft className="size-4" />
                        Voltar
                    </ButtonLink>
                </div>
                <TitlePage
                    title="Editar Administrador"
                    description={`Atualize os dados e acessos do administrador ${admin.name}.`}
                />
            </Section>

            <Section className="mt-8">
                <EditAdminForm admin={admin} />
            </Section>
        </Page>
    );
}
