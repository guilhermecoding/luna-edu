import Page from "@/components/page";
import Section from "@/components/section";
import TitlePage from "@/components/title-page";
import { getPeriodsForTeacherByProgramSlug } from "@/services/programs/programs.service";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { Suspense } from "react";
import type { Metadata } from "next";
import { PeriodListItem } from "@/services/periods/periods.type";
import getPeriodStatus from "@/lib/get-period-status";
import formatDate from "@/lib/format-date";
import { IconCalendarEvent, IconCalendarFilled, IconLock } from "@tabler/icons-react";
import { StaticStatusIndicator } from "@/components/static-status-indicator";
import { ButtonLink } from "@/components/ui/button-link";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
    title: "Meus Períodos",
};

export default async function ProfPeriodsPage({
    params,
}: {
    params: Promise<{ program: string }>;
}) {
    const { program } = await params;

    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        redirect("/entrar");
    }

    return (
        <Page>
            <Section>
                <TitlePage
                    title="Meus Períodos"
                    description="Períodos em que você possui turmas alocadas."
                />
            </Section>

            <Section className="mt-10">
                <Suspense fallback={<PeriodsSkeleton />}>
                    <PeriodsContent
                        programSlug={program}
                        teacherId={session.user.id}
                    />
                </Suspense>
            </Section>
        </Page>
    );
}

async function PeriodsContent({
    programSlug,
    teacherId,
}: {
    programSlug: string;
    teacherId: string;
}) {
    const periods = await getPeriodsForTeacherByProgramSlug(programSlug, teacherId);

    if (periods.length === 0) {
        return (
            <div className="p-8 flex flex-col items-center justify-center text-center border-2 border-dashed border-surface-border rounded-2xl bg-surface/30 gap-3">
                <IconCalendarEvent className="size-10 text-muted-foreground/40" />
                <p className="text-muted-foreground font-medium">
                    Nenhum período encontrado para este programa.
                </p>
            </div>
        );
    }

    const today = new Date();

    // Separar períodos ativos/futuros dos encerrados
    const activePeriods = periods.filter((p) => !p.completedAt);
    const closedPeriods = periods.filter((p) => !!p.completedAt);

    return (
        <div className="flex flex-col gap-8">
            {/* Períodos Ativos e Futuros */}
            {activePeriods.length > 0 && (
                <div className="flex flex-col gap-4">
                    {activePeriods.map((period) => {
                        const { statusLabel, statusVariant } = getPeriodStatus(period, today);
                        return (
                            <PeriodCard
                                key={period.id}
                                period={period}
                                programSlug={programSlug}
                                statusLabel={statusLabel}
                                statusVariant={statusVariant}
                                disabled={false}
                            />
                        );
                    })}
                </div>
            )}

            {/* Separador de Períodos Encerrados */}
            {closedPeriods.length > 0 && (
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                        <div className="flex-1 border-t border-surface-border" />
                        <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <IconLock className="size-4" />
                            Períodos encerrados
                        </span>
                        <div className="flex-1 border-t border-surface-border" />
                    </div>

                    {closedPeriods.map((period) => {
                        const { statusLabel, statusVariant } = getPeriodStatus(period, today);
                        return (
                            <PeriodCard
                                key={period.id}
                                period={period}
                                programSlug={programSlug}
                                statusLabel={statusLabel}
                                statusVariant={statusVariant}
                                disabled={true}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function PeriodCard({
    period,
    programSlug,
    statusLabel,
    statusVariant,
    disabled,
}: {
    period: PeriodListItem;
    programSlug: string;
    statusLabel: string;
    statusVariant: "success" | "warning" | "info" | "done";
    disabled: boolean;
}) {
    return (
        <div
            className={`w-full min-w-0 flex flex-row items-center bg-surface border border-surface-border p-4 rounded-4xl gap-3 transition-opacity ${disabled ? "opacity-50 pointer-events-none select-none" : ""}`}
            aria-disabled={disabled}
        >
            <div className="mb-4 flex min-w-0 flex-1 flex-col sm:mb-0">
                {/* Status (Celular) */}
                <StaticStatusIndicator className="flex sm:hidden ml-1 mb-2" text={statusLabel} variant={statusVariant} />

                <div className="flex w-full @container/item min-w-0 flex-row items-center justify-between">
                    <div className="flex w-full @sm/item:w-1/2 flex-row items-center">
                        {/* Ícone */}
                        <div className="size-14 shrink-0 flex justify-center items-center rounded-xl bg-muted-foreground/30">
                            <IconCalendarFilled className="text-muted-foreground/90 size-7" />
                        </div>

                        {/* Titulo e período */}
                        <div className="ml-4 min-w-0 flex-1">
                            <p className="truncate text-lg font-medium">
                                {period.name}
                            </p>
                            <p className="truncate text-sm font-medium text-muted-foreground/90">
                                {formatDate(period.startDate)} - {formatDate(period.endDate)}
                            </p>
                        </div>
                    </div>

                    {/* Status (Tablet e Desktop) */}
                    <StaticStatusIndicator className="hidden sm:flex" text={statusLabel} variant={statusVariant} />
                </div>
            </div>

            {/* Ação */}
            {!disabled && (
                <ButtonLink
                    href={`/prof/${programSlug}/periodos/${period.slug}/turmas`}
                    size="sm"
                    className="shrink-0"
                >
                    Acessar
                </ButtonLink>
            )}
        </div>
    );
}

function PeriodsSkeleton() {
    return (
        <div className="flex flex-col gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-4xl" />
            ))}
        </div>
    );
}
