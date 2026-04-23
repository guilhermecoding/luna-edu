"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { IconBuilding, IconCalendarEvent, IconLoader2, IconPlus, IconTrash, IconUsers } from "@tabler/icons-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Fragment, useEffect, useMemo } from "react";
import { Controller, type SubmitHandler, useFieldArray, useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
    SelectGroup,
    SelectLabel,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Shift } from "@/generated/prisma/client";
import { isRedirectError } from "@/lib/is-redirect-error";
import { createClassGroupSubjectAction } from "../actions";
import {
    createClassGroupSubjectSchema,
    type CreateClassGroupSubjectInput,
} from "../schema";
import { DAYS_OF_WEEK, dayOfWeekLabels, SHIFTS, shiftLabels } from "../../../../schema";

type FormInput = z.input<typeof createClassGroupSubjectSchema>;
type FormOutput = z.output<typeof createClassGroupSubjectSchema>;

type SubjectData = {
    id: string;
    name: string;
    code: string;
};

type ClassGroupData = {
    id: string;
    name: string;
    slug: string;
    shift: Shift;
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

interface CreateClassGroupSubjectFormProps {
    programSlug: string;
    periodSlug: string;
    classGroupSlug: string;
    classGroup: ClassGroupData;
    subjects: SubjectData[];
    rooms: RoomWithCampus[];
    timeSlots: TimeSlotData[];
    teachers: TeacherData[];
}

export function CreateClassGroupSubjectForm({
    programSlug,
    periodSlug,
    classGroupSlug,
    classGroup,
    subjects,
    rooms,
    timeSlots,
    teachers,
}: CreateClassGroupSubjectFormProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const form = useForm<FormInput, undefined, FormOutput>({
        resolver: zodResolver(createClassGroupSubjectSchema),
        mode: "onChange",
        defaultValues: {
            subjectId: "",
            name: "",
            code: "",
            shift: classGroup.shift,
            roomId: "",
            schedules: [],
        },
    });

    const {
        control,
        register,
        setValue,
        formState: { errors, isSubmitting, isValid, isDirty },
        setError,
        clearErrors,
    } = form;

    const subjectIdValue = useWatch({ control, name: "subjectId" });
    const nameValue = useWatch({ control, name: "name" });
    const codeValue = useWatch({ control, name: "code" });
    const selectedSubject = useMemo(
        () => subjects.find((subject) => subject.id === subjectIdValue),
        [subjects, subjectIdValue],
    );
    const roomsByCampus = useMemo(
        () =>
            rooms.reduce<Record<string, RoomWithCampus[]>>((acc, room) => {
                const campusName = room.campus.name;
                if (!acc[campusName]) {
                    acc[campusName] = [];
                }
                acc[campusName].push(room);
                return acc;
            }, {}),
        [rooms],
    );
    const { fields, append, remove } = useFieldArray({
        control,
        name: "schedules",
    });

    useEffect(() => {
        if (!selectedSubject) return;

        setValue("name", selectedSubject.name, { shouldDirty: true, shouldValidate: true });
        setValue("code", `${classGroup.slug}-${selectedSubject.code}`.toUpperCase(), {
            shouldDirty: true,
            shouldValidate: true,
        });
    }, [selectedSubject, classGroup.slug, setValue]);

    const canSubmit = isValid && isDirty && !isSubmitting && subjects.length > 0;

    const onSubmit: SubmitHandler<CreateClassGroupSubjectInput> = async (data) => {
        clearErrors("root");

        try {
            const result = await createClassGroupSubjectAction(
                programSlug,
                periodSlug,
                classGroupSlug,
                data,
            );

            if (result?.success === false) {
                const params = new URLSearchParams(searchParams.toString());
                params.set("toast", "error");
                params.set("message", result.error || "Erro ao adicionar disciplina");
                router.replace(`${pathname}?${params.toString()}`, { scroll: false });

                setError("root", {
                    type: "server",
                    message: result.error || "Erro ao adicionar disciplina",
                });
                return;
            }
        } catch (error) {
            if (isRedirectError(error)) {
                throw error;
            }

            const params = new URLSearchParams(searchParams.toString());
            params.set("toast", "error");
            params.set("message", "Erro fatal ao adicionar disciplina");
            router.replace(`${pathname}?${params.toString()}`, { scroll: false });

            setError("root", {
                type: "server",
                message: "Erro fatal ao adicionar disciplina",
            });
        }
    };

    if (subjects.length === 0) {
        return (
            <div className="space-y-6">
                <div className="p-4 border-2 border-dashed border-surface-border rounded-xl bg-surface/30 text-center">
                    <p className="text-sm text-muted-foreground">
                        Todas as disciplinas disponíveis para esta matriz/série ja foram adicionadas nesta turma.
                    </p>
                </div>
                <div className="flex justify-end pt-4 border-t">
                    <Button type="button" variant="outline" onClick={() => router.back()} className="w-full sm:w-auto">
                        Voltar
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {errors.root?.message && (
                <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg text-red-900 dark:text-red-200 text-sm">
                    {errors.root.message}
                </div>
            )}

            <div className="space-y-2">
                <Label htmlFor="subjectId">Disciplina Curricular *</Label>
                <Controller
                    control={control}
                    name="subjectId"
                    render={({ field }) => (
                        <Select value={field.value || ""} onValueChange={field.onChange} disabled={isSubmitting}>
                            <SelectTrigger id="subjectId" className="p-5 rounded-lg bg-background w-full">
                                <SelectValue placeholder="Selecione uma disciplina" />
                            </SelectTrigger>
                            <SelectContent>
                                {subjects.map((subject) => (
                                    <SelectItem key={subject.id} value={subject.id}>
                                        {subject.name} ({subject.code})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                />
                {errors.subjectId && (
                    <p className="text-sm text-red-600">{errors.subjectId.message}</p>
                )}
            </div>

            {selectedSubject && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="name">Nome da Disciplina na Turma *</Label>
                        <Input
                            id="name"
                            placeholder="Ex: Matemática"
                            {...register("name")}
                            disabled={isSubmitting}
                            aria-invalid={errors.name ? "true" : "false"}
                            className="p-5 rounded-lg bg-background"
                        />
                        {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="code">Código da Disciplina na Turma *</Label>
                        <Input
                            id="code"
                            placeholder="Ex: 1A-MAT01"
                            {...register("code", {
                                onChange: (event) =>
                                    setValue("code", event.target.value.toUpperCase(), {
                                        shouldDirty: true,
                                        shouldTouch: true,
                                        shouldValidate: true,
                                    }),
                            })}
                            disabled={isSubmitting}
                            aria-invalid={errors.code ? "true" : "false"}
                            className="p-5 rounded-lg bg-background uppercase"
                        />
                        {errors.code && <p className="text-sm text-red-600">{errors.code.message}</p>}
                    </div>

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
                                    <SelectTrigger id="shift" className="p-5 rounded-lg bg-background w-full">
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

                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="roomId">Sala padrão</Label>
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
                                                    {rooms.find((room) => room.id === field.value)?.name}
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
                        {errors.roomId && <p className="text-sm text-red-600">{errors.roomId.message}</p>}
                    </div>

                    <div className="p-4 border border-blue-200 dark:border-blue-800 rounded-xl bg-blue-50 dark:bg-blue-950/30 space-y-1.5 text-sm md:col-span-2">
                        <p>
                            <span className="font-semibold">Turma:</span> {classGroup.name}
                        </p>
                        <p>
                            <span className="font-semibold">Disciplina Curricular:</span> {selectedSubject.name}
                        </p>
                        <p>
                            <span className="font-semibold">Nome final:</span> {nameValue || "-"}
                        </p>
                        <p>
                            <span className="font-semibold">Código final:</span> {codeValue || "-"}
                        </p>
                    </div>

                    <Separator className="md:col-span-2 my-2" />
                    <div className="space-y-4 md:col-span-2">
                        <div className="flex flex-col sm:flex-row gap-y-3 items-center justify-between">
                            <div className="flex items-center gap-2">
                                <IconCalendarEvent className="size-5 text-primary shrink-0" />
                                <div>
                                    <h3 className="text-sm font-bold">Grade de Horários</h3>
                                    <p className="text-xs text-muted-foreground">
                                        Defina os dias e horários das aulas desta disciplina.
                                    </p>
                                </div>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="w-full sm:w-auto"
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

                                        <div className="space-y-1.5">
                                            <Label className="text-xs text-muted-foreground">Sala</Label>
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
                                        </div>

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
                                <IconCalendarEvent className="size-8 text-muted-foreground mb-2 opacity-50 shrink-0" />
                                <p className="text-sm text-muted-foreground">
                                    Nenhum horário adicionado. Clique em &quot;Adicionar Horário&quot; para montar a grade.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end pt-4 border-t items-center mt-6">
                <Button type="button" variant="outline" onClick={() => router.back()} className="w-full sm:w-auto" disabled={isSubmitting}>
                    Cancelar
                </Button>
                <Button className="flex w-full sm:w-auto items-center gap-2" type="submit" disabled={!canSubmit}>
                    {isSubmitting && <IconLoader2 className="size-5 animate-spin" />}
                    {isSubmitting ? "Adicionando..." : "Adicionar Disciplina"}
                </Button>
            </div>
        </form>
    );
}
