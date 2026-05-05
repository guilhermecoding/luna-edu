import Page from "@/components/page";
import Section from "@/components/section";
import TitlePage from "@/components/title-page";
import { ButtonLink } from "@/components/ui/button-link";
import { IconArrowLeft, IconSchool } from "@tabler/icons-react";
import { Metadata } from "next";
import CreateStudentForm from "./_components/create-student-form";

export const metadata: Metadata = {
    title: "Novo Aluno",
};

export default function NewStudentPage() {
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
                            description="Adicione um novo aluno ao sistema. Você pode preencher manualmente ou importar uma planilha."
                        />
                    </div>
                </div>
            </Section>

            <Section className="mt-8">
                <CreateStudentForm />
            </Section>
        </Page>
    );
}
