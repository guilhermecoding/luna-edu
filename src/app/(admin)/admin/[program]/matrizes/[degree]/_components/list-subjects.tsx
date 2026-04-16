import { getSubjectsByDegreeId } from "@/services/subjects/subjects.service";
import { IconBooks, IconPencil } from "@tabler/icons-react";
import Link from "next/link";
import { Suspense } from "react";

function EmptySubjectsList({
    programSlug,
    degreeSlug,
}: {
    programSlug: string,
    degreeSlug: string
}) {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-surface-border rounded-4xl">
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


const AVATAR_COLORS = [
    "bg-green-200 text-green-800",
    "bg-blue-200 text-blue-800",
    "bg-yellow-200 text-yellow-800",
    "bg-teal-200 text-teal-800",
    "bg-cyan-200 text-cyan-800",
    "bg-indigo-200 text-indigo-800",
    "bg-rose-200 text-rose-800",
    "bg-purple-200 text-purple-800",
    "bg-pink-200 text-pink-800",
    "bg-red-200 text-red-800",
];

const getAvatarColor = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % AVATAR_COLORS.length;
    return AVATAR_COLORS[index];
};

async function ListSubjectsContent({
    programSlug,
    degreeSlug,
    degreeId,
}: {
    programSlug: string,
    degreeSlug: string,
    degreeId: string
}) {
    const subjects = await getSubjectsByDegreeId(degreeId);

    if (subjects.length === 0) {
        return (
            <EmptySubjectsList programSlug={programSlug} degreeSlug={degreeSlug} />
        );
    }

    return (
        <div className="overflow-x-auto rounded-4xl border border-surface-border bg-background text-sm">
            <table className="w-full text-left">
                <thead className="bg-primary/5 text-muted-foreground uppercase text-xs">
                    <tr>
                        <th className="px-6 py-4 font-medium">Disciplina/Matéria</th>
                        <th className="px-6 text-center py-4 font-medium">Código</th>
                        <th className="px-6 text-center py-4 font-medium">Carga (h)</th>
                        <th className="px-6 text-center py-4 font-medium">Semestre/Período Base</th>
                        <th className="px-6 py-4 font-medium text-right">Ação</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {subjects.map((subject) => (
                        <tr key={subject.id} className="hover:bg-muted/50 transition-colors">
                            <td className="flex flex-row items-center gap-3 px-6 py-4 text-foreground">
                                <span className={`${getAvatarColor(subject.name)} p-2 size-10 flex items-center justify-center shrink-0 rounded-full text-sm font-medium`}>
                                    {(() => {
                                        const words = subject.name.trim().split(/\s+/);
                                        if (words.length > 1) {
                                            return (words[0][0] + words[0][1] + words[1][0]).toUpperCase();
                                        }
                                        return words[0].slice(0, 2).toUpperCase();
                                    })()}
                                </span>
                                <span className="font-bold text-base text-medium">
                                    {subject.name}
                                </span>
                            </td>
                            <td className="px-6 text-center py-4 text-muted-foreground">
                                {subject.code || "-"}
                            </td>
                            <td className="px-6 text-center py-4">
                                {subject.workload ? `${subject.workload}h` : "Não atribuível"}
                            </td>
                            <td className="px-6 text-center py-4 text-muted-foreground">
                                {subject.basePeriod ? `${subject.basePeriod}º Período` : "Não atribuível"}
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

export default function ListSubjects({
    programSlug,
    degreeSlug,
    degreeId,
}: {
    programSlug: string,
    degreeSlug: string,
    degreeId: string
}) {
    return (
        <Suspense fallback={null}>
            <ListSubjectsContent programSlug={programSlug} degreeSlug={degreeSlug} degreeId={degreeId} />
        </Suspense>
    );
}