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
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useForm, type SubmitHandler, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { createClassGroupAction } from "../actions";
import { classGroupSchema, shiftLabels, type ClassGroupInput } from "../../schema";
import { IconLoader2, IconArrowsShuffle, IconSun, IconSunset2, IconMoon, IconBooks } from "@tabler/icons-react";
import { isRedirectError } from "@/lib/is-redirect-error";
import autoSlug from "@/lib/auto-slug";

type DegreeData = {
    id: string;
    name: string;
    slug: string;
};

type SubjectData = {
    id: string;
    name: string;
    code: string;
    basePeriod: number | null;
    degreeId: string;
};

interface CreateClassGroupFormProps {
    programSlug: string;
    periodSlug: string;
    degrees: DegreeData[];
    subjects: SubjectData[];
}

const shiftIcons = {
    MORNING: IconSun,
    AFTERNOON: IconSunset2,
    EVENING: IconMoon,
} as const;

export function CreateClassGroupForm({
    programSlug,
    periodSlug,
    degrees,
    subjects,
}: CreateClassGroupFormProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const form = useForm<ClassGroupInput>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(classGroupSchema) as any,
        mode: "onChange",
        defaultValues: {
            name: "",
            slug: "",
            degreeId: "",
            basePeriod: undefined,
            shift: undefined,
        },
    });

    const {
        register,
        control,
        formState: { errors, isSubmitting, isValid, isDirty },
        setValue,
        setError,
        clearErrors,
        reset,
    } = form;

    const nameValue = useWatch({ control, name: "name" });
    const slugValue = useWatch({ control, name: "slug" });
    const degreeIdValue = useWatch({ control, name: "degreeId" });

    const canSubmit =
        isValid && isDirty && !isSubmitting && Boolean(nameValue?.trim()) && Boolean(slugValue?.trim());

    // Extrair séries disponíveis para a matriz selecionada
    const availableBasePeriods = useMemo(() => {
        if (!degreeIdValue) return [];
        const periodsSet = new Set<number>();
        subjects
            .filter((s) => s.degreeId === degreeIdValue && s.basePeriod !== null)
            .forEach((s) => periodsSet.add(s.basePeriod!));
        return Array.from(periodsSet).sort((a, b) => a - b);
    }, [degreeIdValue, subjects]);

    // Contar disciplinas que serão auto-geradas
    const selectedBasePeriod = useWatch({ control, name: "basePeriod" });
    const matchingSubjects = useMemo(() => {
        if (!degreeIdValue || !selectedBasePeriod) return [];
        return subjects.filter(
            (s) => s.degreeId === degreeIdValue && s.basePeriod === selectedBasePeriod,
        );
    }, [degreeIdValue, selectedBasePeriod, subjects]);

    useEffect(() => {
        clearErrors();
        reset();
    }, [clearErrors, reset]);

    // Limpar basePeriod quando trocar de Degree
    useEffect(() => {
        setValue("basePeriod", undefined as unknown as number, { shouldValidate: false });
    }, [degreeIdValue, setValue]);

    const onSubmit: SubmitHandler<ClassGroupInput> = async (data) => {
        clearErrors("root");

        try {
            const result = await createClassGroupAction(programSlug, periodSlug, data);

            if (result?.success === false) {
                const params = new URLSearchParams(searchParams.toString());
                params.set("toast", "error");
                params.set("message", result.error || "Erro ao criar grupo");
                router.replace(`${pathname}?${params.toString()}`, { scroll: false });

                setError("root", {
                    type: "server",
                    message: result.error || "Erro ao criar grupo",
                });
                return;
            }
        } catch (error) {
            if (isRedirectError(error)) {
                throw error;
            }

            const params = new URLSearchParams(searchParams.toString());
            params.set("toast", "error");
            params.set("message", "Erro fatal ao criar grupo");
            router.replace(`${pathname}?${params.toString()}`, { scroll: false });

            setError("root", {
                type: "server",
                message: "Erro fatal ao criar grupo",
            });
        }
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {errors.root?.message && (
                <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg text-red-900 dark:text-red-200 text-sm">
                    {errors.root.message}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nome */}
                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="name">Nome do Grupo *</Label>
                    <Input
                        id="name"
                        placeholder="Ex: 1º Ano A, 2ª Série B"
                        {...register("name")}
                        disabled={isSubmitting}
                        aria-invalid={errors.name ? "true" : "false"}
                        className="p-5 rounded-lg bg-background"
                    />
                    {errors.name && (
                        <p className="text-sm text-red-600">{errors.name.message}</p>
                    )}
                </div>

                {/* Código */}
                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="slug">Código do Grupo *</Label>
                    <div className="flex gap-2">
                        <Input
                            id="slug"
                            placeholder="Ex: 1-ANO-A"
                            {...register("slug", {
                                onChange: (e) => {
                                    setValue("slug", e.target.value.toUpperCase(), {
                                        shouldValidate: true,
                                    });
                                },
                            })}
                            disabled={isSubmitting}
                            aria-invalid={errors.slug ? "true" : "false"}
                            className="p-5 rounded-lg bg-background flex-1 uppercase"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            className="px-4 py-1.5 bg-muted hover:bg-muted/80 text-foreground border-surface-border"
                            onClick={() => {
                                const newSlug = autoSlug(nameValue)?.toUpperCase();
                                if (newSlug) {
                                    setValue("slug", newSlug, {
                                        shouldDirty: true,
                                        shouldTouch: true,
                                        shouldValidate: true,
                                    });
                                }
                            }}
                            title="Gerar código a partir do nome"
                        >
                            <IconArrowsShuffle className="size-5" />
                        </Button>
                    </div>
                    {errors.slug && (
                        <p className="text-sm text-red-600">{errors.slug.message}</p>
                    )}
                </div>

                {/* Matriz Curricular */}
                <div className="space-y-2">
                    <Label htmlFor="degreeId">Matriz Curricular *</Label>
                    <Controller
                        control={control}
                        name="degreeId"
                        render={({ field }) => (
                            <Select
                                value={field.value || ""}
                                onValueChange={field.onChange}
                                disabled={isSubmitting}
                            >
                                <SelectTrigger
                                    id="degreeId"
                                    className="p-5 rounded-lg bg-background w-full"
                                >
                                    <SelectValue placeholder="Selecione a matriz" />
                                </SelectTrigger>
                                <SelectContent>
                                    {degrees.map((d) => (
                                        <SelectItem key={d.id} value={d.id}>
                                            {d.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.degreeId && (
                        <p className="text-sm text-red-600">{errors.degreeId.message}</p>
                    )}
                </div>

                {/* Série */}
                <div className="space-y-2">
                    <Label htmlFor="basePeriod">Série *</Label>
                    {!degreeIdValue ? (
                        <div className="p-4 border-2 border-dashed border-surface-border rounded-xl bg-surface/30 text-center">
                            <p className="text-sm text-muted-foreground">
                                Selecione uma Matriz primeiro.
                            </p>
                        </div>
                    ) : availableBasePeriods.length === 0 ? (
                        <div className="p-4 border-2 border-dashed border-surface-border rounded-xl bg-surface/30 text-center">
                            <p className="text-sm text-muted-foreground">
                                Nenhuma disciplina com série definida nesta Matriz.
                            </p>
                        </div>
                    ) : (
                        <Controller
                            control={control}
                            name="basePeriod"
                            render={({ field }) => (
                                <Select
                                    value={field.value?.toString() || ""}
                                    onValueChange={(v) => field.onChange(parseInt(v))}
                                    disabled={isSubmitting}
                                >
                                    <SelectTrigger
                                        id="basePeriod"
                                        className="p-5 rounded-lg bg-background w-full"
                                    >
                                        <SelectValue placeholder="Selecione a série" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableBasePeriods.map((bp) => (
                                            <SelectItem key={bp} value={bp.toString()}>
                                                {bp}ª Série / {bp}º Ano
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    )}
                    {errors.basePeriod && (
                        <p className="text-sm text-red-600">{errors.basePeriod.message}</p>
                    )}
                </div>

                {/* Turno */}
                <div className="space-y-2">
                    <Label htmlFor="shift">Turno *</Label>
                    <Controller
                        control={control}
                        name="shift"
                        render={({ field }) => (
                            <Select
                                value={field.value}
                                onValueChange={field.onChange}
                                disabled={isSubmitting}
                            >
                                <SelectTrigger
                                    id="shift"
                                    className="p-5 rounded-lg bg-background w-full"
                                >
                                    <SelectValue placeholder="Selecione o turno" />
                                </SelectTrigger>
                                <SelectContent>
                                    {(Object.entries(shiftLabels) as [keyof typeof shiftLabels, string][]).map(
                                        ([value, label]) => {
                                            const Icon = shiftIcons[value];
                                            return (
                                                <SelectItem key={value} value={value}>
                                                    <span className="flex items-center gap-2">
                                                        <Icon className="size-4 text-muted-foreground" />
                                                        {label}
                                                    </span>
                                                </SelectItem>
                                            );
                                        },
                                    )}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.shift && (
                        <p className="text-sm text-red-600">{errors.shift.message}</p>
                    )}
                </div>
            </div>

            {/* Preview das turmas que serão criadas */}
            {matchingSubjects.length > 0 && (
                <div className="p-4 border border-blue-200 dark:border-blue-800 rounded-xl bg-blue-50 dark:bg-blue-950/30 space-y-3">
                    <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300">
                        <IconBooks className="size-5" />
                        <p className="font-semibold text-sm">
                            {matchingSubjects.length} turma{matchingSubjects.length !== 1 ? "s" : ""} será{matchingSubjects.length !== 1 ? "ão" : ""} criada{matchingSubjects.length !== 1 ? "s" : ""} automaticamente:
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {matchingSubjects.map((s) => (
                            <span
                                key={s.id}
                                className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-medium"
                            >
                                {s.name}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end pt-4 border-t items-center mt-6">
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
                    {isSubmitting ? "Criando..." : "Criar Grupo"}
                </Button>
            </div>
        </form>
    );
}
