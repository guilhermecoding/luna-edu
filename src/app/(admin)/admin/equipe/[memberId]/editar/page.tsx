import Page from "@/components/page";
import Section from "@/components/section";
import TitlePage from "@/components/title-page";
import { Metadata } from "next";
import { getUserById } from "@/services/users/users.service";
import { notFound } from "next/navigation";
import EditMemberForm from "./_components/edit-member-form";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const metadata: Metadata = {
    title: "Editar Membro",
};

export default async function EditMemberPage({
    params,
}: {
    params: Promise<{ memberId: string }>;
}) {
    const { memberId } = await params;
    const [member, session] = await Promise.all([
        getUserById(memberId),
        auth.api.getSession({ headers: await headers() }),
    ]);

    if (!member || (!member.isAdmin && !member.isTeacher)) {
        notFound();
    }

    const isEditingSelf = session?.user?.id === member.id;

    return (
        <Page>
            <Section>
                <TitlePage
                    title={`Editar ${member.name}`}
                    description="Atualize os dados e acessos deste membro da equipe."
                />
            </Section>

            <Section className="mt-8">
                <EditMemberForm member={member} isEditingSelf={isEditingSelf} />
            </Section>
        </Page>
    );
}
