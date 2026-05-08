"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { useForm, type SubmitHandler, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createTimeSlotAction } from "../../actions";
import { timeSlotSchema, type TimeSlotInput } from "../../schema";
import { SHIFTS, shiftLabels } from "../../../periodos/[period]/turmas/schema";
import { IconLoader2 } from "@tabler/icons-react";
import { useState, useEffect } from "react";

interface CreateTimeSlotFormProps {
    programSlug: string;
}

export function CreateTimeSlotForm({ programSlug }: CreateTimeSlotFormProps) {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        control,
        handleSubmit,
        reset,
        watch,
        trigger,
        formState: { errors, isSubmitting, isValid },
    } = useForm<TimeSlotInput>({
        resolver: zodResolver(timeSlotSchema),
        mode: "onTouched",
        defaultValues: {
            name: "",
            startTime: "",
            endTime: "",
            shift: "MORNING",
        },
    });

    // Limpa o formulário toda vez que entrar nele (montagem do componente)
    useEffect(() => {
        reset();
    }, [reset]);

    const handleFieldChange = () => {
        if (error) setError(null);
    };

    const onSubmit: SubmitHandler<TimeSlotInput> = async (data) => {
        setError(null);
        const result = await createTimeSlotAction(programSlug, data);

        if (result?.success === false) {
            setError(result.error);
            return;
        }

        if (result?.success && result.redirectTo) {
            router.push(result.redirectTo);
            router.refresh();
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg text-red-900 dark:text-red-200 text-sm">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="name">Nome do Horário *</Label>
                    <Input
                        id="name"
                        placeholder="Ex: 1ª Aula, Intervalo, 2ª Aula"
                        {...register("name", { onChange: handleFieldChange })}
                        disabled={isSubmitting}
                        className="p-5 rounded-lg bg-background"
                    />
                    {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="startTime">Início (HH:MM) *</Label>
                    <Input
                        id="startTime"
                        type="time"
                        {...register("startTime", {
                            onChange: (e) => {
                                handleFieldChange();
                                if (e.target.value && watch("endTime")) trigger("endTime");
                            },
                        })}
                        disabled={isSubmitting}
                        className="p-5 rounded-lg bg-background"
                    />
                    {errors.startTime && <p className="text-sm text-red-600">{errors.startTime.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="endTime">Fim (HH:MM) *</Label>
                    <Input
                        id="endTime"
                        type="time"
                        {...register("endTime", {
                            onChange: (e) => {
                                handleFieldChange();
                                if (e.target.value && watch("startTime")) trigger("startTime");
                            },
                        })}
                        disabled={isSubmitting}
                        className="p-5 rounded-lg bg-background"
                    />
                    {errors.endTime && <p className="text-sm text-red-600">{errors.endTime.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="shift">Turno *</Label>
                    <Controller
                        control={control}
                        name="shift"
                        render={({ field }) => (
                            <Select
                                value={field.value}
                                onValueChange={(val) => {
                                    field.onChange(val);
                                    handleFieldChange();
                                }}
                                disabled={isSubmitting}
                            >
                                <SelectTrigger className="p-5 rounded-lg bg-background">
                                    <SelectValue placeholder="Selecione o turno" />
                                </SelectTrigger>
                                <SelectContent>
                                    {SHIFTS.map((shift) => (
                                        <SelectItem key={shift} value={shift}>
                                            {shiftLabels[shift]}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.shift && <p className="text-sm text-red-600">{errors.shift.message}</p>}
                </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end pt-4 border-t items-center mt-6">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={isSubmitting}
                >
                    Cancelar
                </Button>
                <Button className="flex items-center gap-2" type="submit" disabled={!isValid || isSubmitting}>
                    {isSubmitting && <IconLoader2 className="size-5 animate-spin" />}
                    {isSubmitting ? "Salvando..." : "Criar Horário"}
                </Button>
            </div>
        </form>
    );
}
