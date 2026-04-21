import { getCoursesByPeriodId } from "@/services/courses/courses.service";
import { IconUsersGroup, IconEdit, IconChevronRight, IconSun, IconSunset2, IconMoon, IconUser } from "@tabler/icons-react";
import Link from "next/link";
import { Suspense } from "react";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Shift } from "@/generated/prisma/enums";

import { getAvatarColor, getInitials, hashString } from "@/lib/avatar-utils";

const OCCUPANCY_COLORS = [
    { bar: "bg-green-500", text: "text-green-700 dark:text-green-400" },
    { bar: "bg-blue-500", text: "text-blue-700 dark:text-blue-400" },
    { bar: "bg-teal-500", text: "text-teal-700 dark:text-teal-400" },
    { bar: "bg-indigo-500", text: "text-indigo-700 dark:text-indigo-400" },
    { bar: "bg-purple-500", text: "text-purple-700 dark:text-purple-400" },
    { bar: "bg-rose-500", text: "text-rose-700 dark:text-rose-400" },
    { bar: "bg-cyan-500", text: "text-cyan-700 dark:text-cyan-400" },
    { bar: "bg-amber-500", text: "text-amber-700 dark:text-amber-400" },
];

const getOccupancyColor = (name: string) => OCCUPANCY_COLORS[hashString(name) % OCCUPANCY_COLORS.length];


// ── Turno ──────────────────────────────────────────────────────────
function shiftLabel(shift: Shift) {
    switch (shift) {
        case Shift.MORNING: return "Manhã";
        case Shift.AFTERNOON: return "Tarde";
        case Shift.EVENING: return "Noite";
    }
}

function ShiftIcon({ shift }: { shift: Shift }) {
    switch (shift) {
        case Shift.MORNING: return <IconSun className="size-3 sm:size-3.5" />;
        case Shift.AFTERNOON: return <IconSunset2 className="size-3 sm:size-3.5" />;
        case Shift.EVENING: return <IconMoon className="size-3 sm:size-3.5" />;
    }
}

// ── Professores estáticos (placeholder) ────────────────────────────
const STATIC_TEACHERS = [
    "Prof. Ana Silva",
    "Prof. Carlos Souza",
    "Prof. Maria Oliveira",
    "Prof. João Santos",
    "Prof. Fernanda Lima",
    "Prof. Ricardo Alves",
];

function getStaticTeacher(name: string): string {
    return STATIC_TEACHERS[hashString(name) % STATIC_TEACHERS.length];
}

// ── Ocupação estática (placeholder) ────────────────────────────────
function getStaticEnrollment(name: string): number {
    return 15 + (hashString(name) % 25); // entre 15 e 39
}

// ── Skeleton ───────────────────────────────────────────────────────
function ListCoursesSkeleton() {
    return (
        <div className="overflow-x-auto rounded-4xl border border-surface-border bg-surface">
            <table className="w-full text-left border-collapse">
                <thead className="bg-primary/5 text-muted-foreground uppercase text-xs">
                    <tr>
                        <th className="px-6 py-4 font-medium">Turma</th>
                        <th className="px-6 py-4 font-medium text-center">Disciplina</th>
                        <th className="px-6 py-4 font-medium text-center">Professor</th>
                        <th className="px-6 py-4 font-medium text-center">Turno</th>
                        <th className="px-6 py-4 font-medium text-center">Ocupação</th>
                        <th className="px-6 py-4 font-medium text-center">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i}>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="size-10 rounded-full bg-muted-foreground/10" />
                                    <Skeleton className="h-6 w-32 bg-muted-foreground/10" />
                                </div>
                            </td>
                            <td className="px-6 py-4 flex justify-center">
                                <Skeleton className="h-6 w-28 rounded-full bg-muted-foreground/10" />
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex justify-center">
                                    <Skeleton className="h-6 w-28 bg-muted-foreground/10" />
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex justify-center">
                                    <Skeleton className="h-6 w-20 rounded-full bg-muted-foreground/10" />
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex justify-center">
                                    <Skeleton className="h-6 w-24 bg-muted-foreground/10" />
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

// ── Empty state ────────────────────────────────────────────────────
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

// ── Conteúdo principal ─────────────────────────────────────────────
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
                        <th className="px-4 sm:px-6 py-4 font-medium min-w-[200px]">Turma</th>
                        <th className="px-4 sm:px-6 py-4 font-medium text-center min-w-[140px]">Disciplina</th>
                        <th className="px-4 sm:px-6 py-4 font-medium text-center min-w-[150px]">Professor</th>
                        <th className="px-4 sm:px-6 py-4 font-medium text-center min-w-[90px]">Turno</th>
                        <th className="px-4 sm:px-6 py-4 font-medium text-center min-w-[160px]">Ocupação</th>
                        <th className="px-4 sm:px-6 py-4 font-medium text-center whitespace-nowrap min-w-[120px]">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                    {courses.map((course) => {
                        const avatarColor = getAvatarColor(course.subject.name);
                        const teacher = getStaticTeacher(course.name);
                        const enrolled = getStaticEnrollment(course.name);
                        const roomCapacity = course.room ? Number(course.room.capacity) : 0;
                        const occupancyPct = roomCapacity > 0 ? Math.min((enrolled / roomCapacity) * 100, 100) : 0;
                        const roomColor = course.room ? getOccupancyColor(course.room.name) : null;

                        return (
                            <tr key={course.id} className="hover:bg-muted/50 transition-colors group">
                                {/* ── Turma (avatar colorido + nome + grupo) ── */}
                                <td className="px-4 sm:px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <span
                                            className={`${avatarColor} border size-9 sm:size-10 flex items-center justify-center shrink-0 rounded-full text-[10px] sm:text-xs font-bold transition-transform group-hover:scale-105`}
                                        >
                                            {getInitials(course.subject.name)}
                                        </span>
                                        <div className="flex flex-col gap-0.5">
                                            <span className="font-bold text-sm sm:text-base text-foreground" title={course.name}>
                                                {course.code} - {course.name}
                                            </span>
                                            {course.classGroup && (
                                                <span className="inline-flex items-center gap-1 mt-1 text-[13px] text-muted-foreground">
                                                    {course.classGroup.name}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </td>

                                {/* ── Disciplina ── */}
                                <td className="px-4 sm:px-6 py-4">
                                    <div className="flex justify-center">
                                        <span className="text-muted-foreground text-[10px] sm:text-xs whitespace-nowrap" title={course.subject.name}>
                                            {course.subject.name}
                                        </span>
                                    </div>
                                </td>

                                {/* ── Professor (estático) ── */}
                                <td className="px-4 sm:px-6 py-4">
                                    <div className="flex justify-center">
                                        <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs text-foreground whitespace-nowrap">
                                            <IconUser className="size-3 sm:size-3.5 text-muted-foreground" />
                                            {teacher}
                                        </span>
                                    </div>
                                </td>

                                {/* ── Turno ── */}
                                <td className="px-4 sm:px-6 py-4">
                                    <div className="flex justify-center">
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary font-medium text-[10px] sm:text-xs whitespace-nowrap">
                                            <ShiftIcon shift={course.shift} />
                                            {shiftLabel(course.shift)}
                                        </div>
                                    </div>
                                </td>

                                {/* ── Ocupação da Sala ── */}
                                <td className="px-4 sm:px-6 py-4">
                                    <div className="flex justify-center">
                                        {course.room ? (
                                            <div className="w-full max-w-[140px] space-y-1">
                                                <div className="flex items-center justify-between text-[10px]">
                                                    <span className="font-medium truncate" title={course.room.name}>
                                                        {course.room.name}
                                                    </span>
                                                    <span className={`font-bold ${roomColor?.text}`}>
                                                        {enrolled}/{roomCapacity}
                                                    </span>
                                                </div>
                                                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all ${roomColor?.bar}`}
                                                        style={{ width: `${occupancyPct}%` }}
                                                    />
                                                </div>
                                                <span className="text-[9px] text-muted-foreground block text-center">
                                                    {course.room.campus.name}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground/50 text-[10px] sm:text-xs italic whitespace-nowrap">Sem sala</span>
                                        )}
                                    </div>
                                </td>

                                {/* ── Ações ── */}
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
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

// ── Export ──────────────────────────────────────────────────────────
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
