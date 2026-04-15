import StaticStatusIndicator from "@/components/static-status-indicator";
import { Separator } from "@/components/ui/separator";
import {
    Popover,
    PopoverContent,
    PopoverDescription,
    PopoverHeader,
    PopoverTitle,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { IconCalendarFilled, IconDotsVerticalFilled } from "@tabler/icons-react";

function Info({
    label,
    value,
}: {
    label: string;
    value: string | number;
}) {
    return (
        <div className="flex flex-col text-center">
            <span className="text-sm font-medium text-muted-foreground/90">
                {label}
            </span>
            <span className="text-lg font-bold text-muted-foreground/90">
                {value}
            </span>
        </div>
    );
}

function ItemPeriod() {
    return (
        <div className="w-full min-w-0 flex flex-row items-center bg-surface border border-muted-foreground/40 p-4 rounded-4xl gap-3">
            {/* Status (Celular) e Conteúdo */}
            <div className="mb-4 flex min-w-0 flex-1 flex-col sm:mb-0">
                {/* Status (Celular) */}
                <StaticStatusIndicator className="flex sm:hidden ml-1 mb-2" text="FINALIZADO" variant="done" />

                <div className="flex w-full @container/item min-w-0 flex-row items-center justify-between">
                    <div className="flex w-full @sm/item:w-1/2 flex-row items-center">
                        {/* Banner */}
                        <div className="size-14 shrink-0 flex justify-center items-center rounded-xl bg-muted-foreground/30">
                            <IconCalendarFilled className="text-muted-foreground/90 size-7" />
                        </div>

                        {/* Titulo e periodo */}
                        <div className="ml-4 min-w-0 flex-1">
                            <p className="truncate text-lg font-medium">
                                1° Ciclo de 2026789012345677890029282028920282028202820282028202820282028202820
                            </p>
                            <p className="truncate text-sm font-medium text-muted-foreground/90">
                                07 Ago, 2023 - 07 Set, 2023
                            </p>
                        </div>
                    </div>

                    {/* Infos */}
                    <div className="hidden @3xl/main:flex flex-row items-center">
                        <Info label="DICIPLINAS" value={15} />

                        <Separator orientation="vertical" className="mx-4" />

                        <Info label="ALUNOS" value={120} />
                    </div>

                    {/* Status (Tablet e Desktop) */}
                    <StaticStatusIndicator className="hidden sm:flex" text="FINALIZADO" variant="done" />


                </div>
            </div>
            {/* Ações */}
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="bg-transparent border-none p-0">
                        <IconDotsVerticalFilled className="size-6 text-muted-foreground/90" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent align="end">
                    <PopoverHeader>
                        <PopoverTitle>Dimensions</PopoverTitle>
                        <PopoverDescription>
                            Set the dimensions for the layer.
                        </PopoverDescription>
                    </PopoverHeader>
                </PopoverContent>
            </Popover>
        </div>
    );
}

function ListPeriodsContent() {
    return (
        <div className="w-full space-y-6">
            <ItemPeriod />
            <ItemPeriod />
            <ItemPeriod />
        </div>
    );
}

export default function ListOthersPeriods() {
    return (
        <div>
            <h1 className="font-bold text-2xl mb-6">
                Histórico de Períodos
            </h1>
            <ListPeriodsContent />
        </div>
    );
}
