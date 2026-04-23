import Page from "@/components/page";
import Section from "@/components/section";
import TitlePage from "@/components/title-page";
import { IconPencil, IconSchool, IconUsers, IconBooks, IconSun } from "@tabler/icons-react";
import { ButtonLink } from "@/components/ui/button-link";
import { getPeriodByProgramAndSlug } from "@/services/periods/periods.service";
import { getClassGroupByPeriodIdAndSlug } from "@/services/class-groups/class-groups.service";
import { getStudentCountByClassGroupId } from "@/services/students/students.service";
import { notFound } from "next/navigation";
import InfoBoxPeriod from "../../_components/info-box-period";

export default async function ClassPage({
    params,
}: {
    params: Promise<{ program: string; period: string; classGroup: string }>;
}) {
    const { program, period, classGroup: classGroupSlug } = await params;
    
    const periodData = await getPeriodByProgramAndSlug(program, period);
    if (!periodData) {
        notFound();
    }

    const classGroupData = await getClassGroupByPeriodIdAndSlug(periodData.id, classGroupSlug);
    if (!classGroupData) {
        notFound();
    }

    const studentCount = await getStudentCountByClassGroupId(classGroupData.id);
    const disciplinesCount = classGroupData.courses.length;

    const shiftMap: Record<string, string> = {
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
                    <div className="flex flex-1 justify-end items-end">
                        <ButtonLink className="w-full sm:w-auto bg-transparent border-2 border-dashed border-primary hover:bg-primary text-primary hover:text-background hover:border-solid" href={`/admin/${program}/periodos/${period}/turmas/${classGroupSlug}/editar`}>
                            <IconPencil className="size-5" />
                            Editar Turma
                        </ButtonLink>
                    </div>
                </div>
            </Section>

            <Section className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <InfoBoxPeriod
                    label="ALUNOS NA TURMA"
                    value={studentCount}
                    color="indigo"
                    icon={<IconUsers className="size-full" />}
                />
                <InfoBoxPeriod
                    label="DISCIPLINAS"
                    value={disciplinesCount}
                    color="amber"
                    icon={<IconBooks className="size-full" />}
                />
                <InfoBoxPeriod
                    label="TURNO"
                    value={shiftMap[classGroupData.shift] || classGroupData.shift}
                    color="emerald"
                    icon={<IconSun className="size-full" />}
                />
            </Section>
        </Page>
    );
}
