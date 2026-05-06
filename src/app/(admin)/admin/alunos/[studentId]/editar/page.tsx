import Page from "@/components/page";
import Section from "@/components/section";
import TitlePage from "@/components/title-page";
import { IconSchool } from "@tabler/icons-react";
import { Metadata } from "next";
import EditStudentForm from "./_components/edit-student-form";
import { getStudentById } from "@/services/students/students.service";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
    title: "Editar Aluno",
};

export default async function EditStudentPage({
    params,
}: {
    params: Promise<{ studentId: string }>;
}) {
    const { studentId } = await params;

    const student = await getStudentById(studentId);

    if (!student) {
        notFound();
    }

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
                            title="Editar Aluno"
                            description={`Atualizando os dados do aluno ${student.name}.`}
                        />
                    </div>
                </div>
            </Section>

            <Section className="mt-8">
                <EditStudentForm student={student} />
            </Section>
        </Page>
    );
}
