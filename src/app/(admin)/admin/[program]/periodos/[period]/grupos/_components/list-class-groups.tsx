import { getClassGroupsByPeriodId } from "@/services/class-groups/class-groups.service";
import { IconLayoutGrid, IconEdit, IconChevronRight, IconUsersGroup } from "@tabler/icons-react";
import Link from "next/link";
import { Suspense } from "react";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

function ListClassGroupsSkeleton() {
    return (
        <div className="overflow-x-auto rounded-4xl border border-surface-border bg-surface">
            <table className="w-full text-left border-collapse">
                <thead className="bg-primary/5 text-muted-foreground uppercase text-xs">
                    <tr>
                        <th className="px-6 py-4 font-medium">Grupo</th>
                        <th className="px-6 py-4 font-medium text-center">Turmas</th>
                        <th className="px-6 py-4 font-medium text-center">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <tr key={i}>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="size-10 rounded-lg bg-muted-foreground/10" />
                                    <Skeleton className="h-6 w-32 bg-muted-foreground/10" />
                                </div>
                            </td>
                            <td className="px-6 py-4 flex justify-center">
                                <Skeleton className="h-6 w-16 rounded-full bg-muted-foreground/10" />
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex justify-end gap-2">
                                    <Skeleton className="size-8 rounded-lg bg-muted-foreground/10" />
                                    <Skeleton className="h-8 w-20 rounded-lg bg-muted-foreground/10" />
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function EmptyClassGroupsList({
    programSlug,
    periodSlug,
}: {
    programSlug: string;
    periodSlug: string;
}) {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-surface-border rounded-4xl">
            <IconLayoutGrid className="size-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-semibold">Nenhum grupo cadastrado</h3>
            <p className="text-muted-foreground mt-2 max-w-sm mb-6">
                Grupos representam turmas físicas (ex: &quot;1º Ano A&quot;) que agrupam as turmas disciplinares com os mesmos alunos.
            </p>
            <Link
                href={`/admin/${programSlug}/periodos/${periodSlug}/grupos/novo`}
                className="text-primary hover:underline text-sm font-medium"
            >
                + Criar o primeiro grupo
            </Link>
        </div>
    );
}

async function ListClassGroupsContent({
    periodId,
    programSlug,
    periodSlug,
}: {
    periodId: string;
    programSlug: string;
    periodSlug: string;
}) {
    const groups = await getClassGroupsByPeriodId(periodId);

    if (groups.length === 0) {
        return (
            <EmptyClassGroupsList
                programSlug={programSlug}
                periodSlug={periodSlug}
            />
        );
    }

    return (
        <div className="overflow-x-auto rounded-4xl border border-surface-border bg-surface text-sm">
            <table className="w-full text-left border-collapse">
                <thead className="bg-primary/5 text-muted-foreground uppercase text-[10px] sm:text-xs">
                    <tr>
                        <th className="px-4 sm:px-6 py-4 font-medium min-w-[200px]">
                            Grupo
                        </th>
                        <th className="px-4 sm:px-6 py-4 font-medium text-center min-w-[120px]">
                            Turmas
                        </th>
                        <th className="px-4 sm:px-6 py-4 font-medium text-center whitespace-nowrap min-w-[140px]">
                            Ações
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                    {groups.map((group) => (
                        <tr
                            key={group.id}
                            className="hover:bg-muted/50 transition-colors group"
                        >
                            <td className="px-4 sm:px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex justify-center items-center bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 size-8 sm:size-10 rounded-lg text-blue-600 dark:text-blue-400 shrink-0 transition-transform group-hover:scale-105">
                                        <IconLayoutGrid className="size-4 sm:size-5" />
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <span
                                            className="font-bold text-sm sm:text-base text-foreground"
                                            title={group.name}
                                        >
                                            {group.name}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground font-mono uppercase">
                                            {group.slug}
                                        </span>
                                    </div>
                                </div>
                            </td>
                            <td className="px-4 sm:px-6 py-4">
                                <div className="flex justify-center">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted text-muted-foreground font-medium text-[10px] sm:text-xs">
                                        <IconUsersGroup className="size-3 sm:size-3.5" />
                                        {group._count.courses} turma{group._count.courses !== 1 ? "s" : ""}
                                    </span>
                                </div>
                            </td>
                            <td className="px-4 sm:px-6 py-4">
                                <div className="flex flex-row items-center justify-center sm:justify-end gap-1 sm:gap-2">
                                    <Link
                                        href={`/admin/${programSlug}/periodos/${periodSlug}/grupos/${group.slug}/editar`}
                                        className="p-2 inline-flex rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-muted-foreground transition-colors shrink-0"
                                        title="Editar grupo"
                                    >
                                        <IconEdit className="size-4 sm:size-5" />
                                    </Link>

                                    <Separator
                                        orientation="vertical"
                                        className="h-4 bg-surface-border block mt-2.5"
                                    />

                                    <Link
                                        href={`/admin/${programSlug}/periodos/${periodSlug}/turmas?grupo=${group.slug}`}
                                        className="text-primary hover:text-primary/80 text-[10px] sm:text-sm font-bold flex items-center gap-1 transition-colors px-2 py-1 rounded-lg hover:bg-primary/5 whitespace-nowrap shrink-0"
                                    >
                                        <span>Ver Turmas</span>
                                        <IconChevronRight className="size-3 sm:size-4" />
                                    </Link>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default function ListClassGroups({
    periodId,
    programSlug,
    periodSlug,
}: {
    periodId: string;
    programSlug: string;
    periodSlug: string;
}) {
    return (
        <Suspense fallback={<ListClassGroupsSkeleton />}>
            <ListClassGroupsContent
                periodId={periodId}
                programSlug={programSlug}
                periodSlug={periodSlug}
            />
        </Suspense>
    );
}
