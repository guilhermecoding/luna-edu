import { Suspense } from "react";
import { getActiveProgramsAndPeriodsForTeacher } from "@/services/programs/programs.service";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { IconBackpack, IconCalendarEvent, IconBook } from "@tabler/icons-react";
import { ButtonLink } from "@/components/ui/button-link";
import { Skeleton } from "@/components/ui/skeleton";

import { Greeting } from "./_components/greeting";

export default async function ProfDashboardPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        redirect("/entrar");
    }

    const teacherId = session.user.id;

    return (
        <div className="flex-1 w-full flex flex-col p-4 sm:p-6 lg:p-8 xl:p-10 mx-auto max-w-7xl">
            <div className="mb-8">
                <Greeting userName={session.user.name} />
                <p className="text-muted-foreground text-sm sm:text-base">
                    Aqui estão os seus programas e períodos ativos.
                </p>
            </div>

            <Suspense fallback={<DashboardSkeleton />}>
                <TeacherPrograms teacherId={teacherId} />
            </Suspense>
        </div>
    );
}

async function TeacherPrograms({ teacherId }: { teacherId: string }) {
    const programs = await getActiveProgramsAndPeriodsForTeacher(teacherId);

    if (programs.length === 0) {
        return (
            <div className="p-8 flex flex-col items-center justify-center text-center border-2 border-dashed border-surface-border rounded-2xl bg-surface/30 mt-8 gap-3">
                <IconBook className="size-10 text-muted-foreground/40" />
                <p className="text-muted-foreground font-medium">Você não está alocado(a) em nenhuma turma de períodos ativos no momento.</p>
                <p className="text-xs text-muted-foreground">Se acha que isso é um erro, contate a coordenação ou a administração.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-10">
            {programs.map((program) => (
                <div key={program.id} className="flex flex-col gap-5">
                    <div className="flex items-center gap-3 border-b border-surface-border pb-3">
                        <div className="bg-primary/10 p-2 rounded-lg">
                            <IconBackpack className="size-5 text-primary" />
                        </div>
                        <h2 className="text-2xl font-bold text-foreground">{program.name}</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {program.periods.map((period) => (
                            <div key={period.id} className="bg-surface border border-surface-border p-6 rounded-2xl flex flex-col gap-5 hover:border-primary/50 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className="bg-muted p-3 rounded-xl text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                        <IconCalendarEvent className="size-6" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-lg leading-tight text-foreground truncate" title={period.name}>
                                            {period.name}
                                        </h3>
                                        <p className="text-xs text-muted-foreground mt-1 font-medium">
                                            {new Date(period.startDate).toLocaleDateString("pt-BR", { timeZone: "UTC" })} - {new Date(period.endDate).toLocaleDateString("pt-BR", { timeZone: "UTC" })}
                                        </p>
                                    </div>
                                </div>
                                <div className="pt-2 mt-auto">
                                    <ButtonLink href={`/prof/${program.slug}/periodos/${period.slug}/turmas`} className="w-full">
                                        Acessar Minhas Turmas
                                    </ButtonLink>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

function DashboardSkeleton() {
    return (
        <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-5">
                <div className="flex items-center gap-3 border-b border-surface-border pb-3">
                    <Skeleton className="size-9 rounded-lg" />
                    <Skeleton className="h-8 w-64" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    <Skeleton className="h-40 rounded-2xl" />
                    <Skeleton className="h-40 rounded-2xl" />
                </div>
            </div>
        </div>
    );
}
