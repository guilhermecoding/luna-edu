import Page from "@/components/page";
import Section from "@/components/section";
import TitlePage from "@/components/title-page";
import { Metadata } from "next";
import { getUserById } from "@/services/users/users.service";
import { notFound } from "next/navigation";
import EditMemberForm from "./_components/edit-member-form";

export const metadata: Metadata = {
    title: "Editar Membro",
};

export default async function EditMemberPage({
    params,
}: {
    params: Promise<{ memberId: string }>;
}) {
    const { memberId } = await params;
    const member = await getUserById(memberId);

    if (!member || (!member.isAdmin && !member.isTeacher)) {
        notFound();
    }

    return (
        <Page>
            <Section>
                <TitlePage
                    title={`Editar ${member.name}`}
                    description="Atualize os dados e acessos deste membro da equipe."
                />
            </Section>

            <Section className="mt-8">
                <EditMemberForm member={member} />
            </Section>
        </Page>
    );
}
