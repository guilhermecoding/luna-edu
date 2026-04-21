import { getCoursesByPeriodId } from "@/services/courses/courses.service";
import { IconUsersGroup, IconEdit, IconChevronRight, IconSun, IconSunset2, IconMoon } from "@tabler/icons-react";
import Link from "next/link";
import { Suspense } from "react";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Shift } from "@/generated/prisma/enums";

function shiftLabel(shift: Shift) {
    switch (shift) {
        case Shift.MORNING:
            return "Manhã";
        case Shift.AFTERNOON:
            return "Tarde";
        case Shift.EVENING:
            return "Noite";
    }
}

function ShiftIcon({ shift }: { shift: Shift }) {
    switch (shift) {
        case Shift.MORNING:
            return <IconSun className="size-3 sm:size-3.5" />;
        case Shift.AFTERNOON:
            return <IconSunset2 className="size-3 sm:size-3.5" />;
        case Shift.EVENING:
            return <IconMoon className="size-3 sm:size-3.5" />;
    }
}

function ListCoursesSkeleton() {
    return (
        <div className="overflow-x-auto rounded-4xl border border-surface-border bg-surface">
            <table className="w-full text-left border-collapse">
                <thead className="bg-primary/5 text-muted-foreground uppercase text-xs">
                    <tr>
                        <th className="px-6 py-4 font-medium">Turma</th>
                        <th className="px-6 py-4 font-medium text-center">Disciplina</th>
                        <th className="px-6 py-4 font-medium text-center">Turno</th>
                        <th className="px-6 py-4 font-medium text-center">Sala</th>
                        <th className="px-6 py-4 font-medium text-center">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i}>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="size-10 rounded-lg bg-muted-foreground/10" />
                                    <Skeleton className="h-6 w-32 bg-muted-foreground/10" />
                                </div>
                            </td>
                            <td className="px-6 py-4 flex justify-center">
                                <Skeleton className="h-6 w-28 rounded-full bg-muted-foreground/10" />
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex justify-center">
                                    <Skeleton className="h-6 w-20 rounded-full bg-muted-foreground/10" />
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex justify-center">
                                    <Skeleton className="h-6 w-24 rounded-full bg-muted-foreground/10" />
                                </div>
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

function EmptyCoursesList({ programSlug, periodSlug }: { programSlug: string; periodSlug: string }) {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-surface-border rounded-4xl">
            <IconUsersGroup className="size-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-semibold">Nenhuma turma cadastrada</h3>
            <p className="text-muted-foreground mt-2 max-w-sm mb-6">
                As turmas vinculam disciplinas a períodos letivos, definindo turno e sala. Comece cadastrando a primeira turma.
            </p>
            <Link href={`/admin/${programSlug}/periodos/${periodSlug}/turmas/novo`} className="text-primary hover:underline text-sm font-medium">
                + Adicionar a primeira turma
            </Link>
        </div>
    );
}

async function ListCoursesContent({
    periodId,
    programSlug,
    periodSlug,
}: {
    periodId: string;
    programSlug: string;
    periodSlug: string;
}) {
    const courses = await getCoursesByPeriodId(periodId);

    if (courses.length === 0) {
        return <EmptyCoursesList programSlug={programSlug} periodSlug={periodSlug} />;
    }

    return (
        <div className="overflow-x-auto rounded-4xl border border-surface-border bg-surface text-sm">
            <table className="w-full text-left border-collapse">
                <thead className="bg-primary/5 text-muted-foreground uppercase text-[10px] sm:text-xs">
                    <tr>
                        <th className="px-4 sm:px-6 py-4 font-medium min-w-[180px]">Turma</th>
                        <th className="px-4 sm:px-6 py-4 font-medium text-center min-w-[150px]">Disciplina</th>
                        <th className="px-4 sm:px-6 py-4 font-medium text-center min-w-[100px]">Turno</th>
                        <th className="px-4 sm:px-6 py-4 font-medium text-center min-w-[140px]">Sala</th>
                        <th className="px-4 sm:px-6 py-4 font-medium text-center whitespace-nowrap min-w-[140px]">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                    {courses.map((course) => (
                        <tr key={course.id} className="hover:bg-muted/50 transition-colors group">
                            <td className="px-4 sm:px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex justify-center items-center bg-background border border-surface-border size-8 sm:size-10 rounded-lg text-primary shrink-0 transition-transform group-hover:scale-105">
                                        <IconUsersGroup className="size-4 sm:size-5" />
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <span className="font-bold text-sm sm:text-base text-foreground uppercase" title={course.name}>
                                            {course.name}
                                        </span>
                                        {course.classGroup && (
                                            <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                                                <IconUsersGroup className="size-3" />
                                                {course.classGroup.name}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </td>
                            <td className="px-4 sm:px-6 py-4">
                                <div className="flex justify-center">
                                    <span className="text-muted-foreground text-[10px] sm:text-xs whitespace-nowrap" title={course.subject.name}>
                                        {course.subject.name}
                                    </span>
                                </div>
                            </td>
                            <td className="px-4 sm:px-6 py-4">
                                <div className="flex justify-center">
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary font-medium text-[10px] sm:text-xs whitespace-nowrap">
                                        <ShiftIcon shift={course.shift} />
                                        {shiftLabel(course.shift)}
                                    </div>
                                </div>
                            </td>
                            <td className="px-4 sm:px-6 py-4">
                                <div className="flex justify-center">
                                    {course.room ? (
                                        <div className="flex flex-col items-center">
                                            <span className="text-[10px] sm:text-xs font-medium whitespace-nowrap">
                                                {course.room.name}
                                            </span>
                                            <span className="text-[9px] sm:text-[10px] text-muted-foreground whitespace-nowrap">
                                                {course.room.campus.name}
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-muted-foreground/50 text-[10px] sm:text-xs italic whitespace-nowrap">Não definida</span>
                                    )}
                                </div>
                            </td>
                            <td className="px-4 sm:px-6 py-4">
                                <div className="flex flex-row items-center justify-center sm:justify-end gap-1 sm:gap-2">
                                    <Link
                                        href={`/admin/${programSlug}/periodos/${periodSlug}/turmas/${course.code}/editar`}
                                        className="p-2 inline-flex rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-muted-foreground transition-colors shrink-0"
                                        title="Editar turma"
                                    >
                                        <IconEdit className="size-4 sm:size-5" />
                                    </Link>

                                    <Separator orientation="vertical" className="h-4 bg-surface-border block mt-2.5" />

                                    <Link
                                        href={`/admin/${programSlug}/periodos/${periodSlug}/turmas/${course.code}/editar`}
                                        className="text-primary hover:text-primary/80 text-[10px] sm:text-sm font-bold flex items-center gap-1 transition-colors px-2 py-1 rounded-lg hover:bg-primary/5 whitespace-nowrap shrink-0"
                                    >
                                        <span>Detalhes</span>
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

export default function ListCourses({
    periodId,
    programSlug,
    periodSlug,
}: {
    periodId: string;
    programSlug: string;
    periodSlug: string;
}) {
    return (
        <Suspense fallback={<ListCoursesSkeleton />}>
            <ListCoursesContent periodId={periodId} programSlug={programSlug} periodSlug={periodSlug} />
        </Suspense>
    );
}
