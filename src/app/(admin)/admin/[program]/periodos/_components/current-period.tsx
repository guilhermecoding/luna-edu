import PulsingStatusIndicator from "@/components/pulsing-status-indicator";
import TooltipText from "@/components/tooltip-text";
import { ButtonLink } from "@/components/ui/button-link";
import { Progress } from "@/components/ui/progress";
import { IconFileTextFilled, IconHelpHexagonFilled, IconPencilFilled } from "@tabler/icons-react";
import { headers } from "next/headers";
import { Suspense } from "react";
import getPeriodStatus, { isPeriodActiveByDay } from "@/lib/get-period-status";
import { PeriodListItem } from "@/services/periods/periods.type";
import formatDate, { formatDateShort } from "@/lib/format-date";
import getDayKeyInTimeZone, { APP_TIMEZONE } from "@/lib/get-day-key-in-time-zone";

function Info({
    label,
    value,
    info,
}: {
    label: string;
    value: string | number;
    info?: string
}) {
    return (
        <div className="flex flex-col items-start xl:items-center">
            <p className="text-sm font-medium uppercase text-muted-foreground flex flex-row gap-x-1 items-start">
                {label}
                {info && <TooltipText text={info}>
                    <IconHelpHexagonFilled className="size-3 mt-0.5" />
                </TooltipText>}
            </p>
            <p className="text-3xl font-medium uppercase">
                {value}
            </p>
        </div>
    );
}

function EmptyCurrentPeriod() {
    return (
        <div>
            <p className="text-muted-foreground">
                Nenhum período encontrado.
            </p>
        </div>
    );
}

async function CurrentPeriodContent({
    periodsPromise,
    programSlug,
}: {
    periodsPromise: Promise<PeriodListItem[]>;
    programSlug: string;
}) {
    await headers();
    const periods = await periodsPromise;
    const today = new Date();

    const current =
        periods.find((p) => isPeriodActiveByDay(p, today)) ?? periods[0];

    if (!current) {
        return <EmptyCurrentPeriod />;
    }

    const { statusLabel, statusVariant } = getPeriodStatus(current, today);
    const isCurrentPeriodActive = isPeriodActiveByDay(current, today);

    return (
        <div className="w-full border border-surface-border bg-surface p-8 rounded-4xl">
            {/* Primeira linha */}
            <div className="flex flex-col gap-y-3">
                {/* Bagde */}
                <div className="flex items-center">
                    <div className="w-full flex flex-row justify-between">
                        <span className="bg-primary-theme/20 text-sm font-bold max-[400px]:w-min w-auto text-primary-theme px-4 py-1 rounded-full">
                            {isCurrentPeriodActive ? "PERÍODO ATUAL" : (getDayKeyInTimeZone(current.endDate, "UTC") < getDayKeyInTimeZone(today, APP_TIMEZONE) ? "ÚLTIMO PERÍODO" : "PERÍODO FUTURO")}
                        </span>
                        <PulsingStatusIndicator text={statusLabel} variant={statusVariant} />
                    </div>
                </div>
                {/* Status */}
                <div className="flex justify-start sm:justify-end">
                    <span className="text-sm text-muted-foreground">
                        {current.startDate > today ? "Inicia em " : "Desde "} {formatDate(current.startDate)}
                    </span>
                </div>
            </div>

            {/* Segunda linha */}
            <div className="w-full mt-6">
                <h1 className="font-bold capitalize text-4xl xl:text-5xl ">
                    {current.name}
                </h1>
            </div>

            {/* Terceira linha */}
            <div className="mt-8 w-full @2xl/main:flex-row flex flex-col gap-y-4 justify-between">
                <Info label="TURMAS" value={current._count.courses} />
                <Info label="ALUNOS TOTAL" value={current._count.studentPeriods} info="Total de alunos vinculados a este período (Inscritos + Matriculados)" />
                <Info label="ALUNOS MATRICULADOS" value={current.enrolledCount} info="Alunos vinculados em pelo menos uma turma deste período" />
                <Info label="TÉRMINO" value={formatDateShort(current.endDate)} />
            </div>

            {/* Quarta linha */}
            <div className="mt-12">
                {/* Linha superior */}
                <div className="flex flex-row justify-between ">
                    <span className="font-medium">
                        Progresso do período
                    </span>
                    <span className="font-bold text-primary-theme">
                        65%
                    </span>
                </div>
                {/* Barra de progresso */}
                <Progress value={65} className="mt-2 bg-mauve-300" indicatorClassName="bg-primary-theme rounded-full" />

                {/* Linha do link */}
                <div className="flex flex-col-reverse sm:flex-row justify-end items-center mt-6 gap-4">
                    <ButtonLink
                        href={`/admin/${programSlug}/periodos/${current.slug}/editar`}
                        variant="outline"
                        className="bg-transparent text-muted-foreground w-full sm:w-auto"
                    >
                        <IconPencilFilled className="size-5" />
                        Editar
                    </ButtonLink>
                    <ButtonLink
                        href={`/admin/${programSlug}/periodos/${current.slug}`}
                        className="w-full sm:w-auto"
                    >
                        <IconFileTextFilled className="size-5" />
                        Detalhar
                    </ButtonLink>
                </div>
            </div>
        </div>
    );
}

export default function CurrentPeriod({
    periodsPromise,
    programSlug,
}: {
    periodsPromise: Promise<PeriodListItem[]>;
    programSlug: string;
}) {
    if (!periodsPromise) {
        return <EmptyCurrentPeriod />;
    }

    return (
        <Suspense fallback={<div className="w-full h-64 bg-surface rounded-4xl animate-pulse" />}>
            <CurrentPeriodContent periodsPromise={periodsPromise} programSlug={programSlug} />
        </Suspense>
    );
}
