import { getSubjectsByDegreeId } from "@/services/subjects/subjects.service";
import { IconBooks, IconPencil } from "@tabler/icons-react";
import Link from "next/link";

export default async function ListSubjects({ programSlug, degreeSlug, degreeId }: { programSlug: string, degreeSlug: string, degreeId: string }) {
    const subjects = await getSubjectsByDegreeId(degreeId);

    if (subjects.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center border rounded-xl bg-background shadow-sm">
                <IconBooks className="size-12 text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-lg font-semibold">Nenhuma disciplina cadastrada</h3>
                <p className="text-muted-foreground mt-2 max-w-sm mb-6">
                    A primeira etapa para utilizar o sistema é preencher a estrutura curricular das matrizes com as disciplinas teóricas (Cálculo I, Português, etc).
                </p>
                <Link href={`/admin/${programSlug}/matrizes/${degreeSlug}/disciplinas/novo`} className="text-primary hover:underline text-sm font-medium">
                    + Adicionar a primeira disciplina
                </Link>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-xl border bg-background text-sm shadow-sm">
            <table className="w-full text-left">
                <thead className="bg-primary/5 text-muted-foreground uppercase text-xs">
                    <tr>
                        <th className="px-6 py-4 font-medium">Disciplina/Matéria</th>
                        <th className="px-6 py-4 font-medium">Código</th>
                        <th className="px-6 py-4 font-medium">Carga (h)</th>
                        <th className="px-6 py-4 font-medium">Semestre/Período Base</th>
                        <th className="px-6 py-4 font-medium text-right">Ação</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {subjects.map((subject) => (
                        <tr key={subject.id} className="hover:bg-muted/50 transition-colors">
                            <td className="px-6 py-4 font-medium text-foreground">
                                {subject.name}
                            </td>
                            <td className="px-6 py-4 text-muted-foreground">
                                {subject.code || "-"}
                            </td>
                            <td className="px-6 py-4">
                                {subject.workload ? `${subject.workload}h` : "-"}
                            </td>
                            <td className="px-6 py-4 text-muted-foreground">
                                {subject.basePeriod ? `${subject.basePeriod}º Período` : "-"}
                            </td>
                            <td className="px-6 py-4 text-right">
                                <Link
                                    href={`/admin/${programSlug}/matrizes/${degreeSlug}/disciplinas/${subject.id}/editar`}
                                    className="p-2 inline-flex rounded-md hover:bg-black/5 dark:hover:bg-white/10 text-muted-foreground transition-colors"
                                    title="Editar disciplina"
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
