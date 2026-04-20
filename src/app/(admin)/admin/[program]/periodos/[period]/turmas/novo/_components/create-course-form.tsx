"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm, type SubmitHandler, useWatch, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Fragment, useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import { createCourseAction } from "../actions";
import {
    courseSchema,
    type CourseInput,
    SHIFTS,
    shiftLabels,
    DAYS_OF_WEEK,
    dayOfWeekLabels,
} from "../../schema";
import { IconBuilding, IconLoader2, IconUsers, IconPlus, IconTrash, IconCalendarEvent, IconArrowsShuffle } from "@tabler/icons-react";
import { isRedirectError } from "@/lib/is-redirect-error";
import autoSlug from "@/lib/auto-slug";

type SubjectWithDegree = {
    id: string;
    name: string;
    code: string;
    workload: number | null;
    degree: {
        name: string;
        slug: string;
    };
};

type RoomWithCampus = {
    id: string;
    name: string;
    block: string | null;
    capacity: bigint | number;
    campus: {
        name: string;
        slug: string;
    };
};

type TimeSlotData = {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
    shift: string;
};

type TeacherData = {
    id: string;
    name: string;
    email: string;
};

interface CreateCourseFormProps {
    programSlug: string;
    periodSlug: string;
    subjects: SubjectWithDegree[];
    rooms: RoomWithCampus[];
    timeSlots: TimeSlotData[];
    teachers: TeacherData[];
}

export function CreateCourseForm({ programSlug, periodSlug, subjects, rooms, timeSlots, teachers }: CreateCourseFormProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const form = useForm<CourseInput>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(courseSchema) as any,
        mode: "onChange",
        defaultValues: {
            name: "",
            code: "",
            subjectId: undefined,
            roomId: "",
            shift: undefined,
            schedules: [],
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

    const { fields, append, remove } = useFieldArray({
        control,
        name: "schedules",
    });

    const nameValue = useWatch({ control, name: "name" });
    const codeValue = useWatch({ control, name: "code" });
    const canSubmit = isValid && isDirty && !isSubmitting && Boolean(nameValue?.trim()) && Boolean(codeValue?.trim());

    useEffect(() => {
        clearErrors();
        reset();
    }, [clearErrors, reset]);

    const onSubmit: SubmitHandler<CourseInput> = async (data) => {
        clearErrors("root");

        try {
            const result = await createCourseAction(programSlug, periodSlug, data);

            if (result?.success === false) {
                const params = new URLSearchParams(searchParams.toString());
                params.set("toast", "error");
                params.set("message", result.error || "Erro ao criar turma");
                router.replace(`${pathname}?${params.toString()}`, { scroll: false });

                setError("root", {
                    type: "server",
                    message: result.error || "Erro ao criar turma",
                });
                return;
            }
        } catch (error) {
            if (isRedirectError(error)) {
                throw error;
            }

            const params = new URLSearchParams(searchParams.toString());
            params.set("toast", "error");
            params.set("message", "Erro fatal ao criar turma");
            router.replace(`${pathname}?${params.toString()}`, { scroll: false });

            setError("root", {
                type: "server",
                message: "Erro fatal ao criar turma",
            });
        }
    };

    // Group subjects by degree for better UX
    const subjectsByDegree = subjects.reduce<Record<string, SubjectWithDegree[]>>((acc, subject) => {
        const degreeName = subject.degree.name;
        if (!acc[degreeName]) {
            acc[degreeName] = [];
        }
        acc[degreeName].push(subject);
        return acc;
    }, {});

    // Group rooms by campus
    const roomsByCampus = rooms.reduce<Record<string, RoomWithCampus[]>>((acc, room) => {
        const campusName = room.campus.name;
        if (!acc[campusName]) {
            acc[campusName] = [];
        }
        acc[campusName].push(room);
        return acc;
    }, {});

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {errors.root?.message && (
                <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg text-red-900 dark:text-red-200 text-sm">
                    {errors.root.message}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="name">Nome da Turma *</Label>
                    <Input
                        id="name"
                        placeholder="Ex: Turma A - Cálculo I, Laboratório de Física Turma B"
                        {...register("name")}
                        disabled={isSubmitting}
                        aria-invalid={errors.name ? "true" : "false"}
                        className="p-5 rounded-lg bg-background"
                    />
                    {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="code">Código da Turma *</Label>
                    <div className="flex gap-2">
                        <Input
                            id="code"
                            placeholder="Ex: turma-a-calculo-i"
                            {...register("code", {
                                onChange: (e) => {
                                    setValue("code", e.target.value.toUpperCase(), {
                                        shouldValidate: true,
                                    });
                                },
                            })}
                            disabled={isSubmitting}
                            aria-invalid={errors.code ? "true" : "false"}
                            className="p-5 rounded-lg bg-background flex-1 uppercase"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            className="px-4 py-1.5 bg-muted hover:bg-muted/80 text-foreground border-surface-border"
                            onClick={() => {
                                const newCode = autoSlug(nameValue)?.toUpperCase();
                                if (newCode) {
                                    setValue("code", newCode, {
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
                    <p className="text-[10px] text-muted-foreground italic">
                        Este código deve ser único e amigável (apenas letras, números e hífens).
                    </p>
                    {errors.code && <p className="text-sm text-red-600">{errors.code.message}</p>}
                </div>

                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="subjectId">Disciplina *</Label>
                    {subjects.length === 0 ? (
                        <div className="p-4 border-2 border-dashed border-surface-border rounded-xl bg-surface/30 text-center">
                            <p className="text-sm text-muted-foreground">
                                Nenhuma disciplina cadastrada.
                            </p>
                        </div>
                    ) : (
                        <Controller
                            control={control}
                            name="subjectId"
                            render={({ field }) => (
                                <Select
                                    value={field.value}
                                    onValueChange={(value) => {
                                        field.onChange(value);
                                        // Auto-fill name based on subject
                                        const subject = subjects.find((s) => s.id === value);
                                        if (subject) {
                                            const currentName = form.getValues("name");
                                            if (!currentName || currentName.trim() === "") {
                                                setValue("name", subject.name, {
                                                    shouldDirty: true,
                                                    shouldValidate: true,
                                                });
                                            }
                                        }
                                    }}
                                    disabled={isSubmitting}
                                >
                                    <SelectTrigger
                                        id="subjectId"
                                        className="p-5 rounded-lg bg-background w-full"
                                        aria-invalid={errors.subjectId ? "true" : "false"}
                                    >
                                        <SelectValue placeholder="Selecione uma disciplina" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(subjectsByDegree).map(([degreeName, degreeSubjects]) => (
                                            <SelectGroup key={degreeName}>
                                                <SelectLabel className="text-xs text-muted-foreground uppercase font-semibold">
                                                    {degreeName}
                                                </SelectLabel>
                                                {degreeSubjects.map((subject) => (
                                                    <SelectItem key={subject.id} value={subject.id}>
                                                        {subject.name} {subject.code ? `(${subject.code})` : ""}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    )}
                    {errors.subjectId && <p className="text-sm text-red-600">{errors.subjectId.message}</p>}
                </div>

                <div className="space-y-2 md:col-span-1">
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
                                    aria-invalid={errors.shift ? "true" : "false"}
                                >
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

                <div className="space-y-2 md:col-span-1">
                    <Label htmlFor="roomId">Sala padrão</Label>
                    {rooms.length === 0 ? (
                        <div className="p-4 border-2 border-dashed border-surface-border rounded-xl bg-surface/30 text-center">
                            <p className="text-sm text-muted-foreground">
                                Nenhuma sala cadastrada.
                            </p>
                        </div>
                    ) : (
                        <Controller
                            control={control}
                            name="roomId"
                            render={({ field }) => (
                                <Select
                                    value={field.value || ""}
                                    onValueChange={field.onChange}
                                    disabled={isSubmitting}
                                >
                                    <SelectTrigger
                                        id="roomId"
                                        className="p-5 rounded-lg bg-background w-full"
                                        aria-invalid={errors.roomId ? "true" : "false"}
                                    >
                                        <SelectValue placeholder="Selecione uma sala (opcional)">
                                            {field.value ? (
                                                <span key={field.value}>
                                                    {rooms.find((r) => r.id === field.value)?.name}
                                                </span>
                                            ) : null}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(roomsByCampus).map(([campusName, campusRooms]) => (
                                            <SelectGroup key={campusName}>
                                                <SelectLabel className="text-xs text-muted-foreground uppercase font-semibold">
                                                    {campusName}
                                                </SelectLabel>
                                                {campusRooms.map((room, index) => (
                                                    <Fragment key={room.id}>
                                                        <SelectItem value={room.id}>
                                                            <span className="flex flex-col gap-0.5 py-1">
                                                                <span className="font-semibold text-sm">{room.name}</span>
                                                                <span className="flex flex-wrap gap-2 mt-1">
                                                                    <span className="flex items-center gap-1 bg-muted px-2 py-0.5 rounded-md text-[10px] text-muted-foreground border border-surface-border">
                                                                        <IconBuilding className="size-3" />
                                                                        <span>Bloco {room.block || "S/B"}</span>
                                                                    </span>
                                                                    <span className="flex items-center gap-1 bg-muted px-2 py-0.5 rounded-md text-[10px] text-muted-foreground border border-surface-border">
                                                                        <IconUsers className="size-3" />
                                                                        <span>{Number(room.capacity)} vagas</span>
                                                                    </span>
                                                                </span>
                                                            </span>
                                                        </SelectItem>
                                                        {index < campusRooms.length - 1 && (
                                                            <Separator className="my-1 opacity-50" />
                                                        )}
                                                    </Fragment>
                                                ))}
                                            </SelectGroup>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    )}
                    {errors.roomId && <p className="text-sm text-red-600">{errors.roomId.message}</p>}
                </div>
            </div>

            {/* ========== Grade de Horários ========== */}
            <Separator className="my-2" />

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <IconCalendarEvent className="size-5 text-primary" />
                        <div>
                            <h3 className="text-sm font-bold">Grade de Horários</h3>
                            <p className="text-xs text-muted-foreground">
                                Defina os dias e horários das aulas desta turma.
                            </p>
                        </div>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isSubmitting || timeSlots.length === 0}
                        onClick={() =>
                            append({
                                dayOfWeek: "MONDAY",
                                timeSlotId: timeSlots[0]?.id ?? "",
                                teacherId: "",
                                roomId: "",
                            })
                        }
                    >
                        <IconPlus className="size-4 mr-1" />
                        Adicionar Horário
                    </Button>
                </div>

                {timeSlots.length === 0 && (
                    <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg text-amber-900 dark:text-amber-200 text-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                        <span>Nenhum horário cadastrado para este programa. Cadastre os horários primeiro para poder montar a grade.</span>
                        <Button variant="outline" size="sm" className="bg-background border-amber-300 hover:bg-amber-100" asChild>
                            <Link href={`/admin/${programSlug}/horarios`}>
                                Configurar Horários
                            </Link>
                        </Button>
                    </div>
                )}

                {fields.length > 0 && (
                    <div className="space-y-3">
                        {fields.map((field, index) => (
                            <div
                                key={field.id}
                                className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_1fr_auto] gap-3 p-4 rounded-xl border border-surface-border bg-background items-end"
                            >
                                {/* Dia da semana */}
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-muted-foreground">Dia</Label>
                                    <Controller
                                        control={control}
                                        name={`schedules.${index}.dayOfWeek`}
                                        render={({ field: dayField }) => (
                                            <Select
                                                value={dayField.value}
                                                onValueChange={dayField.onChange}
                                                disabled={isSubmitting}
                                            >
                                                <SelectTrigger className="rounded-lg bg-background w-full h-10">
                                                    <SelectValue placeholder="Dia" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {DAYS_OF_WEEK.map((day) => (
                                                        <SelectItem key={day} value={day}>
                                                            {dayOfWeekLabels[day]}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {errors.schedules?.[index]?.dayOfWeek && (
                                        <p className="text-xs text-red-600">{errors.schedules[index].dayOfWeek?.message}</p>
                                    )}
                                </div>

                                {/* Time Slot */}
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-muted-foreground">Horário</Label>
                                    <Controller
                                        control={control}
                                        name={`schedules.${index}.timeSlotId`}
                                        render={({ field: slotField }) => (
                                            <Select
                                                value={slotField.value}
                                                onValueChange={slotField.onChange}
                                                disabled={isSubmitting}
                                            >
                                                <SelectTrigger className="rounded-lg bg-background w-full h-10">
                                                    <SelectValue placeholder="Horário" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {timeSlots.map((slot) => (
                                                        <SelectItem key={slot.id} value={slot.id}>
                                                            {slot.name} ({slot.startTime} - {slot.endTime})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {errors.schedules?.[index]?.timeSlotId && (
                                        <p className="text-xs text-red-600">{errors.schedules[index].timeSlotId?.message}</p>
                                    )}
                                </div>

                                {/* Professor (opcional) */}
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-muted-foreground">Professor</Label>
                                    <Controller
                                        control={control}
                                        name={`schedules.${index}.teacherId`}
                                        render={({ field: teacherField }) => (
                                            <Select
                                                value={teacherField.value || ""}
                                                onValueChange={teacherField.onChange}
                                                disabled={isSubmitting}
                                            >
                                                <SelectTrigger className="rounded-lg bg-background w-full h-10">
                                                    <SelectValue placeholder="Opcional" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {teachers.map((teacher) => (
                                                        <SelectItem key={teacher.id} value={teacher.id}>
                                                            {teacher.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>

                                {/* Sala (override) */}
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-muted-foreground">Sala</Label>
                                    {rooms.length === 0 ? (
                                        <div className="p-3 border border-dashed border-surface-border rounded-lg bg-surface/30 text-center">
                                            <p className="text-[10px] text-muted-foreground">Nenhuma sala</p>
                                        </div>
                                    ) : (
                                        <Controller
                                            control={control}
                                            name={`schedules.${index}.roomId`}
                                            render={({ field: roomField }) => (
                                                <Select
                                                    value={roomField.value || ""}
                                                    onValueChange={roomField.onChange}
                                                    disabled={isSubmitting}
                                                >
                                                    <SelectTrigger className="rounded-lg bg-background w-full h-10">
                                                        <SelectValue placeholder="Sala padrão" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {Object.entries(roomsByCampus).map(([campusName, campusRooms]) => (
                                                            <SelectGroup key={campusName}>
                                                                <SelectLabel className="text-xs text-muted-foreground uppercase font-semibold">
                                                                    {campusName}
                                                                </SelectLabel>
                                                                {campusRooms.map((room) => (
                                                                    <SelectItem key={room.id} value={room.id}>
                                                                        {room.name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectGroup>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                    )}
                                </div>

                                {/* Remover */}
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 h-10 w-10 shrink-0"
                                    onClick={() => remove(index)}
                                    disabled={isSubmitting}
                                    title="Remover horário"
                                >
                                    <IconTrash className="size-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}

                {fields.length === 0 && timeSlots.length > 0 && (
                    <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-surface-border rounded-xl">
                        <IconCalendarEvent className="size-8 text-muted-foreground mb-2 opacity-50" />
                        <p className="text-sm text-muted-foreground">
                            Nenhum horário adicionado. Clique em &quot;Adicionar Horário&quot; para montar a grade.
                        </p>
                    </div>
                )}
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
                <Button className="flex items-center gap-2" type="submit" disabled={!canSubmit}>
                    {isSubmitting && <IconLoader2 className="size-5 animate-spin" />}
                    {isSubmitting ? "Criando..." : "Criar Turma"}
                </Button>
            </div>
        </form>
    );
}
