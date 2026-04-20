import BaseForm from "@/components/base-form";
import Page from "@/components/page";
import Section from "@/components/section";
import { Metadata } from "next";
import { CreateProgramForm } from "./_components/create-program-form";
import { Suspense } from "react";

export const metadata: Metadata = {
    title: "Criar Programa",
};

export default function NewProgramPage() {
    return (
        <Page>
            <Section>
                <BaseForm
                    title="Criar Programa"
                    description="Adicione um novo programa ao sistema"
                >
                    <div className="mt-6">
                        <Suspense fallback={null}>
                            <CreateProgramForm />
                        </Suspense>
                    </div>
                </BaseForm>
            </Section>
        </Page>
    );
}
