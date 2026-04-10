import Page from "@/components/page";
import Section from "@/components/section";
import TitlePage from "@/components/title-page";
import { Button } from "@/components/ui/button";
import { IconCirclePlusFilled } from "@tabler/icons-react";

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
                        <Button className="w-full sm:w-auto">
                            <IconCirclePlusFilled className="size-5" />
                            Criar Programa
                        </Button>
                    </div>
                </div>
            </Section>
        </Page>
    );
}
