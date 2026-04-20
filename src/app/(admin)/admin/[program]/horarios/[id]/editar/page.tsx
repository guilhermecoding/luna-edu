import BaseForm from "@/components/base-form";
import Page from "@/components/page";
import Section from "@/components/section";
import { Suspense } from "react";
import { EditTimeSlotForm } from "../../_components/edit-time-slot-form";
import { Metadata } from "next";
import SkeletonForm from "@/components/skeletons/skeleton-form";
import { getTimeSlotById } from "@/services/schedules/schedules.service";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
    title: "Editar Horário",
};

async function EditTimeSlotContent({
    params,
}: {
    params: Promise<{ program: string; id: string }>;
}) {
    const { program, id } = await params;
    const timeSlot = await getTimeSlotById(id);

    if (!timeSlot) {
        notFound();
    }

    return (
        <Page>
            <Section>
                <BaseForm
                    title="Editar Horário"
                    description={`Atualize as informações do horário ${timeSlot.name}.`}
                >
                    <div className="mt-6">
                        <Suspense fallback={<SkeletonForm />}>
                            <EditTimeSlotForm
                                programSlug={program}
                                timeSlotId={id}
                                initialData={timeSlot}
                            />
                        </Suspense>
                    </div>
                </BaseForm>
            </Section>
        </Page>
    );
}

export default function EditTimeSlotPage({
    params,
}: {
    params: Promise<{ program: string; id: string }>;
}) {
    return <EditTimeSlotContent params={params} />;
}
