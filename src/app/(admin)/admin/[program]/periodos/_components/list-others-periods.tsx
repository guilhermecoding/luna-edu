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
        <div className="w-full bg-surface flex flex-row justify-between items-center border border-muted-foreground/40 p-4 rounded-4xl">
            <div className="flex flex-row items-center">
                {/* Banner */}
                <div className="size-14 flex justify-center items-center rounded-xl bg-muted-foreground/30">
                    <IconCalendarFilled className="text-muted-foreground/90 size-7" />
                </div>

                {/* Titulo e periodo */}
                <div className="ml-6">
                    <p className="font-medium text-lg">1° Ciclo de 2026</p>
                    <p className="text-sm font-medium text-muted-foreground/90">
                        07 Ago, 2023 - 07 Set, 2023
                    </p>
                </div>
            </div>

            {/* Infos */}
            <div className="flex flex-row items-center">
                <Info label="DICIPLINAS" value={15} />

                <Separator orientation="vertical" className="mx-4" />

                <Info label="ALUNOS" value={120} />
            </div>

            {/* Status e ações */}
            <div className="flex flex-row gap-3 items-center">
                {/* Status */}
                <StaticStatusIndicator text="FINALIZADO" variant="done" />

                {/* Ações */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="bg-transparent border-none">
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
