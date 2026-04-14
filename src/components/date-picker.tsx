"use client";

import { cn } from "@/lib/utils";

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
    placeholder,
    disabled,
    className,
}: DatePickerProps) {
    const inputValue = value ? value.toISOString().slice(0, 10) : "";

    return (
        <input
            type="date"
            value={inputValue}
            onChange={(event) => {
                const nextValue = event.target.value;

                if (!nextValue) {
                    onChange(undefined);
                    return;
                }

                onChange(new Date(`${nextValue}T00:00:00`));
            }}
            disabled={disabled}
            placeholder={placeholder}
            className={cn(
                "h-10 rounded-xl border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50",
                className,
            )}
        />
    );
}
