import BaseForm from "@/components/base-form";
import Page from "@/components/page";
import Section from "@/components/section";
import { Suspense } from "react";
import { RoomForm } from "../_components/room-form";
import { Metadata } from "next";
import SkeletonForm from "@/components/skeletons/skeleton-form";
import { getCampusBySlug } from "@/services/campuses/campuses.service";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
    title: "Nova Sala",
};

export default async function NewRoomPage({
    params,
}: {
    params: Promise<{ campus: string }>;
}) {
    const { campus } = await params;
    const campusData = await getCampusBySlug(campus);

    if (!campusData) {
        notFound();
    }

    return (
        <Page>
            <Section>
                <BaseForm
                    title="Nova Sala"
                    description={`Cadastre uma nova sala ou laboratório em ${campusData.name}.`}
                >
                    <div className="mt-6">
                        <Suspense fallback={<SkeletonForm />}>
                            <RoomForm campusSlug={campus} />
                        </Suspense>
                    </div>
                </BaseForm>
            </Section>
        </Page>
    );
}
