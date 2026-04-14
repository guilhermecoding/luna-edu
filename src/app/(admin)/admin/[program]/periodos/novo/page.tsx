import BaseForm from "@/components/base-form";
import Page from "@/components/page";
import Section from "@/components/section";
import { Suspense } from "react";
import { CreatePeriodForm } from "./_components/create-period-form";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Novo Período",
};

export default async function NewPeriodPage({
    params,
}: PageProps<"/admin/[program]/periodos/novo">) {
    const { program } = await params;

    return (
        <Page>
            <Section>
                <BaseForm
                    title="Novo Período"
                    description="Adicione um novo período letivo ao sistema"
                >
                    <div className="mt-6">
                        <Suspense fallback={null}>
                            <CreatePeriodForm programSlug={program} />
                        </Suspense>
                    </div>
                </BaseForm>
            </Section>
        </Page>
    );
}
