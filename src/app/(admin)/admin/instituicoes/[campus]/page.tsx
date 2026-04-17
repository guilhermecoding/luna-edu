import { redirect } from "next/navigation";

export default async function CampusDetailsPage({ params }: PageProps<"/admin/instituicoes/[campus]">) {
    const { campus } = await params;
    redirect(`/admin/instituicoes/${campus}/salas`);
}
