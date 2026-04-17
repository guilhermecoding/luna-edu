import { getCampuses } from "@/services/campuses/campuses.service";
import { IconBuildingCommunity, IconPencil } from "@tabler/icons-react";
import Link from "next/link";
import { Suspense } from "react";

function EmptyCampusesList() {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-surface-border rounded-4xl">
            <IconBuildingCommunity className="size-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-semibold">Nenhuma instituição cadastrada</h3>
            <p className="text-muted-foreground mt-2 max-w-sm mb-6">
                Comece cadastrando sua primeira instituição ou campus para poder gerenciar as salas e turmas.
            </p>
            <Link href="/admin/instituicoes/novo" className="text-primary hover:underline text-sm font-medium">
                + Adicionar a primeira instituição
            </Link>
        </div>
    );
}

async function ListCampusesContent() {
    const campuses = await getCampuses();

    if (campuses.length === 0) {
        return (
            <EmptyCampusesList />
        );
    }

    return (
        <div className="overflow-x-auto rounded-4xl border border-surface-border bg-background text-sm">
            <table className="w-full text-left">
                <thead className="bg-primary/5 text-muted-foreground uppercase text-xs">
                    <tr>
                        <th className="px-6 py-4 font-medium">Nome da Instituição</th>
                        <th className="px-6 py-4 font-medium">Endereço</th>
                        <th className="px-6 py-4 font-medium text-right">Ação</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {campuses.map((campus) => (
                        <tr key={campus.id} className="hover:bg-muted/50 transition-colors">
                            <td className="px-6 py-4 text-foreground font-bold">
                                {campus.name}
                            </td>
                            <td className="px-6 py-4 text-muted-foreground">
                                {campus.address || "-"}
                            </td>
                            <td className="px-6 py-4 text-right">
                                <Link
                                    href={`/admin/instituicoes/${campus.id}/editar`}
                                    className="p-2 inline-flex rounded-md hover:bg-black/5 dark:hover:bg-white/10 text-muted-foreground transition-colors"
                                    title="Editar instituição"
                                >
                                    <IconPencil className="size-4" />
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default function ListCampuses() {
    return (
        <Suspense fallback={null}>
            <ListCampusesContent />
        </Suspense>
    );
}
