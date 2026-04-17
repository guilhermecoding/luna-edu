import Page from "@/components/page";
import Section from "@/components/section";
import TitlePage from "@/components/title-page";
import { IconCirclePlusFilled, IconDoor } from "@tabler/icons-react";
import { ButtonLink } from "@/components/ui/button-link";
import { Metadata } from "next";
import { getCampusBySlug } from "@/services/campuses/campuses.service";
import { notFound } from "next/navigation";
import ListRooms from "./_components/list-rooms";

export const metadata: Metadata = {
    title: "Gerenciar Salas",
};

export default async function RoomsPage({
    params,
}: {
    params: Promise<{ campus: string }>;
}) {
    const { campus } = await params;
    const campusData = await getCampusBySlug(campus);

    if (!campusData) {
        notFound();
    }

    return (
        <Page>
            <Section>
                <div className="flex flex-row items-center gap-1 mb-3">
                    <IconDoor className="size-4 text-muted-foreground" />
                    <p className="text-muted-foreground font-bold">Salas</p>
                </div>
                <div className="flex flex-col lg:flex-row gap-y-6">
                    <div className="flex-1">
                        <TitlePage
                            title={campusData.name}
                            description="Gerencie as salas e laboratórios disponíveis neste campus."
                        />
                    </div>
                    <div className="flex flex-1 justify-end items-end">
                        <ButtonLink className="w-full sm:w-auto" href={`/admin/instituicoes/${campus}/salas/novo`}>
                            <IconCirclePlusFilled className="size-5" />
                            Adicionar Sala
                        </ButtonLink>
                    </div>
                </div>
            </Section>

            <Section className="mt-18">
                <ListRooms campusSlug={campus} />
            </Section>
        </Page>
    );
}
