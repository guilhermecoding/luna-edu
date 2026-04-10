import Page from "@/components/page";
import Section from "@/components/section";
import TitlePage from "@/components/title-page";
import { IconCirclePlusFilled } from "@tabler/icons-react";
import ListPrograms from "./_components/list-programs";
import { ButtonLink } from "@/components/ui/button-link";

export const metadata = {
    title: "Programas - Admin",
    description: "Gerencie os programas de aprendizado disponíveis na sua instituição.",
};
export default function ProgramsPage() {
    return (
        <Page>
            <Section>
                <div className="flex flex-col lg:flex-row gap-y-6">
                    <div className="flex-1">
                        <TitlePage
                            title="Programas"
                            description="Gerencie os programas de aprendizado disponíveis na sua instituição."
                        />
                    </div>
                    <div className="flex flex-1 justify-end items-end">
                        <ButtonLink className="w-full sm:w-auto" href="/admin/programas/criar">
                            <IconCirclePlusFilled className="size-5" />
                            Criar Programa
                        </ButtonLink>
                    </div>
                </div>
            </Section>

            <Section className="mt-18">
                <ListPrograms />
            </Section>
        </Page>
    );
}
