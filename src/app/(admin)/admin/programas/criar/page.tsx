import BaseForm from "@/components/base-form";
import Page from "@/components/page";
import Section from "@/components/section";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Criar Programa",
};

export default function CreateProgramPage() {
    return (
        <Page>
            <Section>
                <BaseForm title="Criar Programa">
                    Bunda
                </BaseForm>
            </Section>
        </Page>
    );
}
