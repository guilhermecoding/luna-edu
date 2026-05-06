import Page from "@/components/page";
import Section from "@/components/section";
import TitlePage from "@/components/title-page";
import { IconSchool } from "@tabler/icons-react";
import { Metadata } from "next";
import CreateStudentForm from "./_components/create-student-form";

export const metadata: Metadata = {
    title: "Novo Aluno",
};

export default async function NewStudentPage({
    searchParams,
}: {
    searchParams: Promise<{ periodId?: string; redirect?: string }>;
}) {
    const { periodId, redirect } = await searchParams;

    return (
        <Page>
            <Section>
                <div className="flex flex-row items-center gap-1 mb-3">
                    <IconSchool className="size-4 text-muted-foreground" />
                    <p className="text-muted-foreground font-bold">Alunos</p>
                </div>
                <div className="flex flex-col lg:flex-row gap-y-6">
                    <div className="flex-1">
                        <TitlePage
                            title="Novo Aluno"
                            description={periodId ? "Adicione um novo aluno ao sistema e vincule-o automaticamente ao período atual." : "Adicione um novo aluno ao sistema. Você pode preencher manualmente ou importar uma planilha CSV. Alunos adicionados aqui não terão vinculo com nenhum período."}
                        />
                    </div>
                </div>
            </Section>

            <Section className="mt-8">
                <CreateStudentForm periodId={periodId} redirectPath={redirect} />
            </Section>
        </Page>
    );
}
