import BaseForm from "@/components/base-form";
import Page from "@/components/page";
import Section from "@/components/section";
import { Suspense } from "react";
import { EditCampusForm } from "./_components/edit-campus-form";
import { Metadata } from "next";
import { getCampusBySlug } from "@/services/campuses/campuses.service";
import { notFound } from "next/navigation";
import SkeletonForm from "@/components/skeletons/skeleton-form";

export const metadata: Metadata = {
    title: "Editar Instituição",
};

export default async function EditCampusPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;

    const campusData = await getCampusBySlug(slug);

    if (!campusData) {
        notFound();
    }

    return (
        <Page>
            <Section>
                <BaseForm
                    title="Editar Instituição"
                    description={`Editando as informações de: ${campusData.name}`}
                >
                    <div className="mt-6">
                        <Suspense fallback={<SkeletonForm />}>
                            <EditCampusForm
                                initialData={campusData}
                            />
                        </Suspense>
                    </div>
                </BaseForm>
            </Section>
        </Page>
    );
}
