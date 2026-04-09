import Page from "@/components/page";
import Section from "@/components/section";
import { Button } from "@/components/ui/button";
import { IconCalendarPlus } from "@tabler/icons-react";

export default function PeriodsPage() {
    return (
        <Page>
            <Section>
                <h1 className="font-bold text-3xl md:text-4xl">
                    Gestão de Períodos
                </h1>
                <div className="mt-2 w-full flex flex-col gap-4 lg:flex-row md:items-start">
                    <h3 className="flex-1 md:max-w-3/4 text-muted-foreground text-sm md:text-base">
                        Gerencie os períodos letivos do programa. Adicione, edite ou remova períodos conforme necessário para manter o calendário acadêmico atualizado.
                    </h3>
                    <div className="flex w-full lg:w-auto justify-end">
                        <Button className="flex items-center w-full sm:w-auto gap-2 whitespace-nowrap">
                            <IconCalendarPlus className="size-5" />
                            <span className="text-base mt-0.5">
                                Adicionar Período
                            </span>
                        </Button>
                    </div>
                </div>
            </Section>
        </Page>
    );
}
