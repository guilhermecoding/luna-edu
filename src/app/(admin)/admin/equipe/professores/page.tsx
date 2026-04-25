import Page from "@/components/page";
import Section from "@/components/section";
import { IconBriefcase } from "@tabler/icons-react";

export default function TeachersPage() {
    return (
        <Page>
            <Section>
                <div className="flex flex-row items-center gap-1 mb-3">
                    <IconBriefcase className="size-4 text-muted-foreground" />
                    <p className="text-muted-foreground font-bold">Professores</p>
                </div>
            </Section>
        </Page>
    );
}
