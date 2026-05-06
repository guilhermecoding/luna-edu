import Page from "@/components/page";
import Section from "@/components/section";
import TitlePage from "@/components/title-page";
import { ButtonLink } from "@/components/ui/button-link";
import { getClassGroupByPeriodIdAndSlug } from "@/services/class-groups/class-groups.service";
import { getPeriodByProgramAndSlug } from "@/services/periods/periods.service";
import { getStudentCountByClassGroupId, getStudentsByClassGroupList } from "@/services/students/students.service";
import { IconBooks, IconClockHour2, IconPencil, IconSchool, IconUsers } from "@tabler/icons-react";
import { notFound } from "next/navigation";
import InfoBoxPeriod from "../../_components/info-box-period";
import ListDisciplines from "../_components/list-disciplines";
import { Metadata } from "next";
import { Shift } from "@/generated/prisma/enums";
import { DataTableClassStudents } from "./_components/data-table-class-students";
import { columns } from "../../alunos/_components/columns-period";
import { AddStudentsToClassSheet } from "./_components/add-students-to-class-sheet";

export const metadata: Metadata = {
    title: "Detalhes da Turma",
};

export default async function ClassPage({
    params,
    searchParams,
}: {
    params: Promise<{ program: string; period: string; classGroup: string }>;
    searchParams: Promise<{ q?: string }>;
}) {
    const { program, period, classGroup: classGroupSlug } = await params;
    const { q } = await searchParams;

    const periodData = await getPeriodByProgramAndSlug(program, period);
    if (!periodData) {
        notFound();
    }

    const classGroupData = await getClassGroupByPeriodIdAndSlug(periodData.id, classGroupSlug);
    if (!classGroupData) {
        notFound();
    }

    const [studentCount, disciplinesCount, studentsList] = await Promise.all([
        getStudentCountByClassGroupId(classGroupData.id),
        Promise.resolve(classGroupData.courses.length),
        getStudentsByClassGroupList(classGroupData.id, q),
    ]);

    const shiftMap: Record<Shift, string> = {
        MORNING: "MATUTINO",
        AFTERNOON: "VESPERTINO",
        EVENING: "NOTURNO",
    };

    return (
        <Page>
            <Section>
                <div className="flex flex-row items-center gap-1 mb-3">
                    <IconSchool className="size-4 text-muted-foreground" />
                    <p className="text-muted-foreground font-bold">Detalhes da Turma</p>
                </div>
                <div className="flex flex-col lg:flex-row gap-y-6">
                    <div className="flex-1">
                        <TitlePage
                            title={classGroupData.name}
                            description={`Informações da turma ${classGroupData.name}.`}
                        />
                    </div>
                    <div className="flex flex-col sm:flex-row flex-1 gap-3 justify-end items-end">
                        <ButtonLink className="w-full sm:w-auto bg-transparent border-2 border-dashed border-primary hover:bg-primary text-primary hover:text-background hover:border-solid" href={`/admin/${program}/periodos/${period}/turmas/${classGroupSlug}/editar`}>
                            <IconPencil className="size-5" />
                            Editar Turma
                        </ButtonLink>
                        <AddStudentsToClassSheet
                            periodId={periodData.id}
                            classGroupId={classGroupData.id}
                            classGroupName={classGroupData.name}
                        />
                    </div>
                </div>
            </Section>

            <Section className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <InfoBoxPeriod
                    label="ALUNOS NA TURMA"
                    value={studentCount}
                    color="emerald"
                    icon={<IconUsers className="size-full" />}
                />
                <InfoBoxPeriod
                    label="DISCIPLINAS"
                    value={disciplinesCount}
                    color="indigo"
                    icon={<IconBooks className="size-full" />}
                />
                <InfoBoxPeriod
                    label="TURNO"
                    value={shiftMap[classGroupData.shift] || classGroupData.shift}
                    color="amber"
                    icon={<IconClockHour2 className="size-full" />}
                />
            </Section>

            <Section className="mt-12">
                <div className="flex flex-row items-center gap-2 mb-6">
                    <div className="bg-primary/10 p-2 rounded-lg">
                        <IconBooks className="size-5 text-primary" />
                    </div>
                    <h2 className="text-xl font-bold text-foreground">Disciplinas Ofertadas</h2>
                </div>

                <ListDisciplines
                    courses={classGroupData.courses}
                    programSlug={program}
                    periodSlug={period}
                    classGroupSlug={classGroupSlug}
                    studentCount={studentCount}
                />
            </Section>

            <Section className="mt-12">
                <div className="flex flex-row items-center gap-2 mb-6">
                    <div className="bg-primary/10 p-2 rounded-lg">
                        <IconUsers className="size-5 text-primary" />
                    </div>
                    <h2 className="text-xl font-bold text-foreground">Alunos Matriculados</h2>
                </div>

                <DataTableClassStudents
                    columns={columns}
                    data={studentsList}
                    periodId={periodData.id}
                    classGroupId={classGroupData.id}
                />
            </Section>
        </Page>
    );
}
