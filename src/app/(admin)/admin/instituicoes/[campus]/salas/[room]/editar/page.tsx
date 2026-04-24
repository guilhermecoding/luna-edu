import BaseForm from "@/components/base-form";
import Page from "@/components/page";
import Section from "@/components/section";
import { Suspense } from "react";
import { EditRoomForm } from "./_components/edit-room-form";
import { Metadata } from "next";
import SkeletonForm from "@/components/skeletons/skeleton-form";
import { getCampusBySlug } from "@/services/campuses/campuses.service";
import { getRoomBySlug } from "@/services/rooms/rooms.service";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
    title: "Editar Sala",
};

async function EditRoomContent({
    params,
}: Omit<PageProps<"/admin/instituicoes/[campus]/salas/[room]/editar">, "searchParams">) {
    const { campus, room } = await params;

    const [campusData, roomData] = await Promise.all([
        getCampusBySlug(campus),
        getRoomBySlug(campus, room),
    ]);

    if (!campusData || !roomData) {
        notFound();
    }

    return (
        <Page>
            <Section>
                <BaseForm
                    title="Editar Sala"
                    description={`Editando as informações de: ${roomData.name} — ${campusData.name}`}
                >
                    <div className="mt-6">
                        <Suspense fallback={<SkeletonForm />}>
                            <EditRoomForm campusSlug={campus} initialData={roomData} />
                        </Suspense>
                    </div>
                </BaseForm>
            </Section>
        </Page>
    );
}

export default function EditRoomPage({
    params,
}: PageProps<"/admin/instituicoes/[campus]/salas/[room]/editar">) {
    return <EditRoomContent params={params} />;
}
