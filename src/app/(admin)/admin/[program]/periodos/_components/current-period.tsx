import PulsingStatusIndicator from "@/components/pulsing-status-indicator";
import TooltipText from "@/components/tooltip-text";
import { Progress } from "@/components/ui/progress";
import { IconHelpHexagonFilled } from "@tabler/icons-react";

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
        <div className="flex flex-col items-center">
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

export default function CurrentPeriod() {
    return (
        <div className="w-3/5 border border-muted-foreground/40 bg-slate-100 dark:bg-muted p-8 rounded-4xl space-y-3">
            {/* Primeira linha */}
            <div className="flex flew-row justify-between">
                {/* Bagde */}
                <div className="flex items-center">
                    <span className="bg-primary-theme/20 text-sm font-bold text-primary-theme px-4 py-1 rounded-full">
                        PERÍODO ATUAL
                    </span>
                </div>
                {/* Status */}
                <div className="flex flex-col items-center">
                    <PulsingStatusIndicator text="ATIVO" variant="success" />
                    <span className="text-sm text-muted-foreground">
                        Desde 14 de abril de 2024
                    </span>
                </div>
            </div>

            {/* Segunda linha */}
            <div className="w-full">
                <h1 className="font-bold capitalize text-5xl ">
                    1 Ciclo de 2026
                </h1>
            </div>

            {/* Terceira linha */}
            <div className="flex justify-between mt-8">
                <Info label="DISCIPLINAS" value={12} />
                <Info label="EST. TOTAL" value={562} info="Total de estudantes adicionados neste período" />
                <Info label="EST. MATRICULADOS" value={342} info="Estudantes vinculados em pelo menos uma disciplina deste período" />
                <Info label="TÉRMINO" value="22 jun" />
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
            </div>
        </div>
    );
}
