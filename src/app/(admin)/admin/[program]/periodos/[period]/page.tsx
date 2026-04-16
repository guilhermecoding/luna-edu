import Page from "@/components/page";
import Section from "@/components/section";
import { IconSchoolFilled } from "@tabler/icons-react";

export default function PeriodPage() {
    return (
        <Page>
            <Section className="pt-4">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-row items-center gap-3">
                        <IconSchoolFilled className="text-primary-theme" />
                        <span className="text-primary-theme text-xl font-bold">UBERHUB CODE</span>
                    </div>
                    <h1 className="text-5xl font-bold">
                        2° Ciclo de 2026
                    </h1>
                </div>
                <div className="bg-">
                    <p>
                        Status
                    </p>
                    <p>
                        ATIVO
                    </p>
                </div>
            </Section>
        </Page>
    );
}
