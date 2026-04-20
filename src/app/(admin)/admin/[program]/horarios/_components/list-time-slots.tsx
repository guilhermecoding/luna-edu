"use client";

import { Card } from "@/components/ui/card";
import { IconClock, IconTrash, IconEdit, IconArrowsSort } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { shiftLabels } from "../../periodos/[period]/turmas/schema";
import Link from "next/link";

interface TimeSlot {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
    shift: string;
}

interface ListTimeSlotsProps {
    timeSlots: TimeSlot[];
    programSlug: string;
}

export default function ListTimeSlots({ timeSlots, programSlug }: ListTimeSlotsProps) {
    if (timeSlots.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-surface-border rounded-4xl bg-surface/30">
                <IconClock className="size-12 text-muted-foreground mb-4 opacity-20" />
                <h3 className="text-xl font-bold">Nenhum horário configurado</h3>
                <p className="text-muted-foreground mt-2 max-w-sm">
                    Você ainda não definiu a grade de horários para este programa. Adicione o primeiro horário para começar.
                </p>
            </div>
        );
    }

    // Group by shift
    const grouped = timeSlots.reduce<Record<string, TimeSlot[]>>((acc, slot) => {
        if (!acc[slot.shift]) acc[slot.shift] = [];
        acc[slot.shift].push(slot);
        return acc;
    }, {});

    return (
        <div className="space-y-8">
            {Object.entries(grouped).map(([shift, slots]) => (
                <div key={shift} className="space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2 px-2">
                        <span className="w-2 h-6 bg-primary rounded-full" />
                        {shiftLabels[shift as keyof typeof shiftLabels] || shift}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {slots.sort((a, b) => a.startTime.localeCompare(b.startTime)).map((slot, index) => (
                            <Card key={slot.id} className="p-5 border-surface-border bg-surface hover:border-primary/50 transition-colors group">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="size-12 rounded-2xl bg-muted flex items-center justify-center font-bold text-primary border border-surface-border">
                                            {index + 1}º
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg">{slot.name}</h4>
                                            <div className="flex items-center gap-2 text-muted-foreground text-sm mt-1">
                                                <IconClock className="size-4" />
                                                <span>{slot.startTime} — {slot.endTime}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="icon" className="size-9 rounded-xl" asChild>
                                            <Link href={`/admin/${programSlug}/horarios/${slot.id}/editar`}>
                                                <IconEdit className="size-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
