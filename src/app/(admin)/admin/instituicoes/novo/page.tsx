import BaseForm from "@/components/base-form";
import Page from "@/components/page";
import Section from "@/components/section";
import { Suspense } from "react";
import { CreateCampusForm } from "./_components/create-campus-form";
import { Metadata } from "next";
import SkeletonForm from "@/components/skeletons/skeleton-form";

export const metadata: Metadata = {
    title: "Nova Instituição",
};

export default function NewCampusPage() {
    return (
        <Page>
            <Section>
                <BaseForm
                    title="Nova Instituição (Campus)"
                    description="Cadastre uma nova instituição ou bloco para associar com salas e turmas."
                >
                    <div className="mt-6">
                        <Suspense fallback={<SkeletonForm />}>
                            <CreateCampusForm />
                        </Suspense>
                    </div>
                </BaseForm>
            </Section>
        </Page>
    );
}
