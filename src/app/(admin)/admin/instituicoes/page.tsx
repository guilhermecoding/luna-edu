import Page from "@/components/page";
import Section from "@/components/section";
import TitlePage from "@/components/title-page";
import { IconCirclePlusFilled } from "@tabler/icons-react";
import ListCampuses from "./_components/list-campuses";
import { ButtonLink } from "@/components/ui/button-link";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Instituições",
};

export default function CampusesPage() {
    return (
        <Page>
            <Section>
                <div className="flex flex-col lg:flex-row gap-y-6">
                    <div className="flex-1">
                        <TitlePage
                            title="Instituições (Campi)"
                            description="Gerencie as instituições e campi da sua rede educacional."
                        />
                    </div>
                    <div className="flex flex-1 justify-end items-end">
                        <ButtonLink className="w-full sm:w-auto" href="/admin/instituicoes/novo">
                            <IconCirclePlusFilled className="size-5" />
                            Adicionar Instituição
                        </ButtonLink>
                    </div>
                </div>
            </Section>

            <Section className="mt-18">
                <ListCampuses />
            </Section>
        </Page>
    );
}
