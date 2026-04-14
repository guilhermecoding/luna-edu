"use client";

import * as React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { IconChevronDown } from "@tabler/icons-react";

type DatePickerProps = {
    value?: Date;
    onChange: (value: Date | undefined) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
};

export function DatePicker({
    value,
    onChange,
    placeholder = "Selecione a data",
    disabled,
    className,
}: DatePickerProps) {
    const isMobile = useIsMobile();

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    data-empty={!value}
                    disabled={disabled}
                    className={cn(
                        "h-10 w-53 justify-between rounded-xl px-3 text-left font-normal data-[empty=true]:text-muted-foreground",
                        className,
                    )}
                >
                    <span className="truncate">
                        {value ? format(value, "PPP", { locale: ptBR }) : placeholder}
                    </span>
                    <IconChevronDown className="size-4" />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className={cn(
                    "p-0",
                    isMobile ? "w-[calc(100vw-3rem)] max-w-88" : "w-auto",
                )}
                align="start"
                sideOffset={8}
            >
                <Calendar
                    mode="single"
                    selected={value}
                    onSelect={onChange}
                    defaultMonth={value}
                    locale={ptBR}
                    disabled={disabled}
                    className="mx-auto [--cell-size:--spacing(7)]"
                    classNames={{
                        root: "w-full",
                    }}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    );
}
