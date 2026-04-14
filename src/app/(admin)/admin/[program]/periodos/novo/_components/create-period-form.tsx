"use client";

import { isRedirectError } from "@/lib/is-redirect-error";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconCalendar, IconLoader2 } from "@tabler/icons-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import z from "zod";
import { createPeriodAction } from "../actions";
import { createPeriodSchema } from "../schema";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type FormInput = z.input<typeof createPeriodSchema>;
type FormOutput = z.output<typeof createPeriodSchema>;

type CreatePeriodFormProps = {
    programSlug: string;
};

export function CreatePeriodForm({ programSlug }: CreatePeriodFormProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const form = useForm<FormInput, undefined, FormOutput>({
        resolver: zodResolver(createPeriodSchema),
        mode: "onChange",
        defaultValues: {
            name: "",
            startDate: undefined,
            endDate: undefined,
        },
    });

    const {
        register,
        reset,
        setError,
        clearErrors,
        control,
        formState: { errors, isSubmitting, isValid },
        watch,
    } = form;

    const nameValue = watch("name");
    const startDateValue = watch("startDate");
    const endDateValue = watch("endDate");
    const canSubmit = isValid && Boolean(nameValue?.trim()) && Boolean(startDateValue) && Boolean(endDateValue) && !isSubmitting;

    useEffect(() => {
        clearErrors();

        return () => {
            reset({
                name: "",
                startDate: undefined,
                endDate: undefined,
            });
        };
    }, [clearErrors, reset]);

    const onSubmit: SubmitHandler<FormOutput> = async (data) => {
        clearErrors("root");

        try {
            const result = await createPeriodAction(programSlug, data);

            if (result?.success === false) {
                const params = new URLSearchParams(searchParams.toString());
                params.set("toast", "error");
                params.set("message", result.error || "Erro ao criar período");
                router.replace(`${pathname}?${params.toString()}`, { scroll: false });

                setError("root", {
                    type: "server",
                    message: result.error || "Erro ao criar período",
                });

                return;
            }
        } catch (error) {
            if (isRedirectError(error)) {
                throw error;
            }

            const params = new URLSearchParams(searchParams.toString());
            params.set("toast", "error");
            params.set("message", "Erro ao criar período");
            router.replace(`${pathname}?${params.toString()}`, { scroll: false });

            setError("root", {
                type: "server",
                message: "Erro ao criar período",
            });
        }
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {errors.root?.message && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900">
                    {errors.root.message}
                </div>
            )}

            <div className="space-y-2">
                <Label htmlFor="name">Nome do Período *</Label>
                <Input
                    id="name"
                    placeholder="Ex: 2026.1"
                    {...register("name")}
                    disabled={isSubmitting}
                    aria-invalid={errors.name ? "true" : "false"}
                    className="rounded-lg bg-background p-5"
                />
                {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <Controller
                    control={control}
                    name="startDate"
                    render={({ field }) => (
                        <div className="space-y-2">
                            <Label>Data de Início *</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start rounded-lg bg-background p-5 text-left font-normal",
                                            !field.value && "text-muted-foreground",
                                        )}
                                        disabled={isSubmitting}
                                    >
                                        <IconCalendar className="size-4" />
                                        {field.value ? format(field.value, "PPP", { locale: ptBR }) : <span>Selecione a data</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        disabled={isSubmitting}
                                        locale={ptBR}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            {errors.startDate && <p className="text-sm text-red-600">{errors.startDate.message}</p>}
                        </div>
                    )}
                />

                <Controller
                    control={control}
                    name="endDate"
                    render={({ field }) => (
                        <div className="space-y-2">
                            <Label>Data de Término *</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start rounded-lg bg-background p-5 text-left font-normal",
                                            !field.value && "text-muted-foreground",
                                        )}
                                        disabled={isSubmitting}
                                    >
                                        <IconCalendar className="size-4" />
                                        {field.value ? format(field.value, "PPP", { locale: ptBR }) : <span>Selecione a data</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        disabled={isSubmitting}
                                        locale={ptBR}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            {errors.endDate && <p className="text-sm text-red-600">{errors.endDate.message}</p>}
                        </div>
                    )}
                />
            </div>

            <div className="flex flex-col-reverse justify-end gap-3 pt-4 sm:flex-row">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={isSubmitting}
                >
                    Cancelar
                </Button>
                <Button className="flex items-center gap-2" type="submit" disabled={!canSubmit}>
                    {isSubmitting && <IconLoader2 className="size-5 animate-spin" />}
                    {isSubmitting ? "Criando..." : "Criar Período"}
                </Button>
            </div>
        </form>
    );
}