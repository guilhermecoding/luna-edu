import Page from "@/components/page";
import Section from "@/components/section";
import { IconSchoolFilled } from "@tabler/icons-react";

export default function PeriodPage() {
    return (
        <Page>
            <Section className="space-y-5">
                {/* Nome do programa */}
                <div>
                    <div className="flex flex-row items-center gap-3">
                        <IconSchoolFilled className="text-primary-theme" />
                        <span className="text-primary-theme text-xl font-bold">UBERHUB CODE</span>
                    </div>
                </div>

                {/* Titulo e status */}
                <div className="flex flex-row justify-between">
                    {/* Titulo */}
                    <h1 className="text-5xl font-bold">
                        2° Ciclo de 2026
                    </h1>
                    {/* Status */}
                    <div className="bg-muted border border-surface-border flex flex-col px-6 py-4 rounded-lg text-center">
                        <p className="text-sm text-muted-foreground">
                            Status
                        </p>
                        <p className="font-bold text-xl text-primary-theme">
                            ATIVO
                        </p>
                    </div>
                </div>
            </Section>
        </Page>
    );
}
