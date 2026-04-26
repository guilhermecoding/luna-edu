import Page from "@/components/page";
import Section from "@/components/section";
import TitlePage from "@/components/title-page";
import { IconArrowLeft } from "@tabler/icons-react";
import { ButtonLink } from "@/components/ui/button-link";
import { Metadata } from "next";
import { getTeachers } from "@/services/users/teachers.service";
import CreateAdminForm from "./_components/create-admin-form";

export const metadata: Metadata = {
    title: "Novo Administrador",
};

export default async function NewAdminPage() {
    const teachers = await getTeachers();

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
                    title="Novo Administrador"
                    description="Adicione um novo administrador ao sistema. Você pode criar um do zero ou selecionar um professor existente."
                />
            </Section>

            <Section className="mt-8">
                <CreateAdminForm teachers={teachers} />
            </Section>
        </Page>
    );
}
