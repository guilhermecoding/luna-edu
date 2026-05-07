import Page from "@/components/page";
import Section from "@/components/section";
import TitlePage from "@/components/title-page";
import { Metadata } from "next";
import { getAdmins } from "@/services/users/admins.service";
import CreateTeacherForm from "./_components/create-teacher-form";

export const metadata: Metadata = {
    title: "Novo Professor",
};

export default async function NewTeacherPage() {
    // Busca administradores para permitir promovê-los a professor
    const admins = await getAdmins();

    return (
        <Page>
            <Section>
                <TitlePage
                    title="Novo Professor"
                    description="Adicione um novo professor ao sistema. Você pode criar um do zero ou selecionar um administrador existente."
                />
            </Section>

            <Section className="mt-8">
                <CreateTeacherForm admins={admins} />
            </Section>
        </Page>
    );
}
