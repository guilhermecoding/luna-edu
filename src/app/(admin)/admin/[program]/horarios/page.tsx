import Page from "@/components/page";
import Section from "@/components/section";
import TitlePage from "@/components/title-page";
import { ButtonLink } from "@/components/ui/button-link";
import { IconCirclePlusFilled, IconClock } from "@tabler/icons-react";
import { Metadata } from "next";
import { getTimeSlotsByProgramSlug } from "@/services/schedules/schedules.service";
import ListTimeSlots from "./_components/list-time-slots";

export const metadata: Metadata = {
    title: "Configurar Horários",
};

export default async function TimeSlotsPage({
    params,
}: {
    params: Promise<{ program: string }>;
}) {
    const { program } = await params;
    const timeSlots = await getTimeSlotsByProgramSlug(program);

    return (
        <Page>
            <Section>
                <div className="flex flex-row items-center gap-1 mb-3">
                    <IconClock className="size-4 text-muted-foreground" />
                    <p className="text-muted-foreground font-bold">Configurações</p>
                </div>
                <div className="flex flex-col lg:flex-row gap-y-6">
                    <div className="flex-1">
                        <TitlePage
                            title="Grade de Horários"
                            description="Defina os horários padrão das aulas (ex: 1ª aula, 2ª aula) para este programa."
                        />
                    </div>
                    <div className="flex flex-1 justify-end items-end">
                        <ButtonLink className="w-full sm:w-auto" href={`/admin/${program}/horarios/novo`}>
                            <IconCirclePlusFilled className="size-5" />
                            Adicionar Horário
                        </ButtonLink>
                    </div>
                </div>
            </Section>

            <Section className="mt-8">
                <ListTimeSlots timeSlots={timeSlots} programSlug={program} />
            </Section>
        </Page>
    );
}
