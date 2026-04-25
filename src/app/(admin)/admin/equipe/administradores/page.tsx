import Page from "@/components/page";
import Section from "@/components/section";
import { IconUserShield } from "@tabler/icons-react";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Administradores",
};

export default function AdministratorsPage() {
    return (
        <Page>
            <Section>
                <div className="flex flex-row items-center gap-1 mb-3">
                    <IconUserShield className="size-4 text-muted-foreground" />
                    <p className="text-muted-foreground font-bold">Administradores</p>
                </div>
            </Section>
        </Page>
    );
}
