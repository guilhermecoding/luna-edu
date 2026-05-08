"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { IconAlertTriangle, IconBuilding, IconCalendarEvent, IconLoader2, IconPlus, IconTrash, IconUsers } from "@tabler/icons-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Fragment, useEffect, useMemo, useState } from "react";
import { Controller, type SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
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
import Image from "next/image";
import imgGibbyDuvida from "@/assets/images/logo-gibby-duvida.svg";
import { DAYS_OF_WEEK, dayOfWeekLabels, shiftLabels } from "../../../../../schema";
import {
    deleteClassGroupCourseAction,
    editClassGroupCourseAction,
} from "../actions";
import {
    editClassGroupCourseSchema,
    type EditClassGroupCourseInput,
} from "../schema";
import { ButtonLink } from "luna-edu/src/components/ui/button-link";

type FormInput = z.input<typeof editClassGroupCourseSchema>;
type FormOutput = z.output<typeof editClassGroupCourseSchema>;

type SubjectOption = {
    id: string;
    name: string;
    code: string;
};

type EditClassGroupSubjectFormProps = {
    programSlug: string;
    periodSlug: string;
    classGroupSlug: string;
    courseCode: string;
    defaultValues: {
        name: string;
        code: string;
        subjectId: string;
        shift: Shift;
        roomId: string;
        schedules: {
            dayOfWeek: (typeof DAYS_OF_WEEK)[number];
            timeSlotId: string;
            teacherId?: string;
            roomId?: string;
        }[];
    };
    subjects: SubjectOption[];
    rooms: {
        id: string;
        name: string;
        block: string | null;
        capacity: bigint | number;
        campus: {
            name: string;
            slug: string;
        };
    }[];
    timeSlots: {
        id: string;
        name: string;
        startTime: string;
        endTime: string;
        shift: string;
    }[];
    teachers: {
        id: string;
        name: string;
        email: string;
    }[];
};

export function EditClassGroupSubjectForm({
    programSlug,
    periodSlug,
    classGroupSlug,
    courseCode,
    defaultValues,
    subjects,
    rooms,
    timeSlots,
    teachers,
}: EditClassGroupSubjectFormProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteConfirmationName, setDeleteConfirmationName] = useState("");
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const form = useForm<FormInput, undefined, FormOutput>({
        resolver: zodResolver(editClassGroupCourseSchema),
        mode: "onChange",
        defaultValues: {
            name: defaultValues.name,
            subjectId: defaultValues.subjectId,
            shift: defaultValues.shift,
            roomId: defaultValues.roomId,
            schedules: defaultValues.schedules,
        },
    });

    const {
        control,
        register,
        formState: { errors, isSubmitting, isValid },
        setError,
        clearErrors,
        reset,
    } = form;
    const { fields, append, remove } = useFieldArray({
        control,
        name: "schedules",
    });
    const roomsByCampus = useMemo(
        () =>
            rooms.reduce<Record<string, (typeof rooms)[number][]>>((acc, room) => {
                const campusName = room.campus.name;
                if (!acc[campusName]) {
                    acc[campusName] = [];
                }
                acc[campusName].push(room);
                return acc;
            }, {}),
        [rooms],
    );

    const canSubmit = isValid && !isSubmitting;
    const canDelete = deleteConfirmationName === defaultValues.name && !isDeleting;

    useEffect(() => {
        clearErrors();

        return () => {
            reset({
                name: defaultValues.name,
                subjectId: defaultValues.subjectId,
                shift: defaultValues.shift,
                roomId: defaultValues.roomId,
                schedules: defaultValues.schedules,
            });
        };
    }, [clearErrors, defaultValues.name, defaultValues.roomId, defaultValues.schedules, defaultValues.shift, defaultValues.subjectId, reset]);

    const onSubmit: SubmitHandler<EditClassGroupCourseInput> = async (data) => {
        clearErrors("root");

        try {
            const result = await editClassGroupCourseAction(
                programSlug,
                periodSlug,
                classGroupSlug,
                courseCode,
                data,
            );

            if (result?.success === false) {
                const params = new URLSearchParams(searchParams.toString());
                params.set("toast", "error");
                params.set("message", result.error || "Erro ao atualizar disciplina");
                router.replace(`${pathname}?${params.toString()}`, { scroll: false });

                setError("root", {
                    type: "server",
                    message: result.error || "Erro ao atualizar disciplina",
                });
                return;
            }

            if (result?.success && result.redirectTo) {
                router.push(result.redirectTo);
                router.refresh();
                return;
            }
        } catch (error) {
            const params = new URLSearchParams(searchParams.toString());
            params.set("toast", "error");
            params.set("message", "Erro ao atualizar disciplina");
            router.replace(`${pathname}?${params.toString()}`, { scroll: false });

            setError("root", {
                type: "server",
                message: "Erro ao atualizar disciplina",
            });
        }
    };

    const onDeleteCourse = async () => {
        setDeleteError(null);
        setIsDeleting(true);

        try {
            const result = await deleteClassGroupCourseAction(
                programSlug,
                periodSlug,
                classGroupSlug,
                courseCode,
                deleteConfirmationName,
            );

            if (result?.success === false) {
                const params = new URLSearchParams(searchParams.toString());
                params.set("toast", "error");
                params.set("message", result.error || "Erro ao apagar disciplina");
                router.replace(`${pathname}?${params.toString()}`, { scroll: false });
                setDeleteError(result.error || "Erro ao apagar disciplina");
                return;
            }

            if (result?.success && result.redirectTo) {
                router.push(result.redirectTo);
                router.refresh();
                return;
            }
        } catch (error) {
            const params = new URLSearchParams(searchParams.toString());
            params.set("toast", "error");
            params.set("message", "Erro ao apagar disciplina");
            router.replace(`${pathname}?${params.toString()}`, { scroll: false });
            setDeleteError("Erro ao apagar disciplina");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {errors.root?.message && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-900 text-sm">
                    {errors.root.message}
                </div>
            )}

            <div className="space-y-2">
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
                <Label htmlFor="subjectId">Disciplina Curricular *</Label>
                <Controller
                    control={control}
                    name="subjectId"
                    render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange} disabled={isSubmitting}>
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
                {errors.subjectId && <p className="text-sm text-red-600">{errors.subjectId.message}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="shift">Turno *</Label>
                <Controller
                    control={control}
                    name="shift"
                    render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange} disabled={isSubmitting}>
                            <SelectTrigger id="shift" className="p-5 rounded-lg bg-background w-full">
                                <SelectValue placeholder="Selecione o turno" />
                            </SelectTrigger>
                            <SelectContent>
                                {(Object.keys(shiftLabels) as Shift[]).map((shift) => (
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

            <div className="space-y-2">
                <Label htmlFor="roomId">Sala padrão</Label>
                {rooms.length === 0 ? (
                    <div className="p-4 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-surface-border rounded-xl bg-surface/30 text-center">
                        <p className="text-sm text-muted-foreground">
                            Nenhuma sala cadastrada.
                            <br /> Comece cadastrando a sala na instituição correspondente.
                        </p>
                        <ButtonLink variant="outline" href={"/admin/instituicoes"} className="w-full sm:w-auto">
                            <IconPlus className="size-4 mr-1" />
                            Adicionar Sala
                        </ButtonLink>
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
                )}
                {errors.roomId && <p className="text-sm text-red-600">{errors.roomId.message}</p>}
            </div>

            <Separator className="my-2" />
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-y-3 items-center justify-between">
                    <div className="flex items-center gap-2">
                        <IconCalendarEvent className="size-5 text-primary shrink-0" />
                        <div>
                            <h3 className="text-sm font-bold">Grade de Horários</h3>
                            <p className="text-xs text-muted-foreground">
                                Edite os dias e horários das aulas desta disciplina.
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
                                    {teachers.length === 0 ? (
                                        <div className="h-10 flex items-center px-3 rounded-lg border-2 border-dashed border-surface-border bg-surface/30 text-[10px] text-muted-foreground leading-tight">
                                            Nenhum professor cadastrado.
                                        </div>
                                    ) : (
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
                                    )}
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

            <div className="space-y-2 cursor-not-allowed!">
                <Label htmlFor="code">Código da Disciplina</Label>
                <Input
                    id="code"
                    value={defaultValues.code}
                    disabled
                    readOnly
                    className="w-full p-5 rounded-lg bg-muted text-muted-foreground uppercase"
                />
                <p className="text-xs text-muted-foreground">
                    O código não pode ser alterado.
                </p>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end pt-4">
                <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
                    Cancelar
                </Button>
                <Button className="flex items-center gap-2" type="submit" disabled={!canSubmit}>
                    {isSubmitting && <IconLoader2 className="size-5 animate-spin" />}
                    {isSubmitting ? "Salvando..." : "Salvar Alterações"}
                </Button>
            </div>

            <div className="border border-destructive/25 bg-destructive/5 rounded-2xl p-4 sm:p-5 space-y-4">
                <div>
                    <div className="flex flex-row items-center gap-2">
                        <IconAlertTriangle className="size-5 text-red-600" />
                        <h3 className="text-xl font-semibold text-destructive">Zona de Perigo</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                        Esta ação remove a disciplina ofertada <b>permanentemente</b> e não pode ser desfeita.
                    </p>
                </div>

                <Dialog
                    open={isDeleteModalOpen}
                    onOpenChange={(open) => {
                        setIsDeleteModalOpen(open);
                        if (!open) {
                            setDeleteConfirmationName("");
                            setDeleteError(null);
                        }
                    }}
                >
                    <div className="w-full flex justify-end">
                        <DialogTrigger asChild>
                            <Button type="button" variant="destructive" className="w-full sm:w-auto">
                                Apagar Disciplina
                            </Button>
                        </DialogTrigger>
                    </div>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Apagar Disciplina</DialogTitle>
                            <DialogDescription>
                                Deseja realmente apagar esta disciplina?
                            </DialogDescription>
                        </DialogHeader>

                        <div className="flex flex-col items-center">
                            <Image className="w-32 h-32" src={imgGibbyDuvida} alt="Gibby Duvida" width={100} height={100} />
                            <span> Para confirmar, digite exatamente o nome da disciplina: <strong>{defaultValues.name}</strong></span>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirm-delete-course-name">Nome da disciplina</Label>
                            <Input
                                id="confirm-delete-course-name"
                                value={deleteConfirmationName}
                                onChange={(event) => setDeleteConfirmationName(event.target.value)}
                                placeholder="Digite o nome exato para confirmar"
                                className="rounded-lg"
                                disabled={isDeleting}
                            />
                            {deleteError && <p className="text-sm text-red-600">{deleteError}</p>}
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsDeleteModalOpen(false)}
                                disabled={isDeleting}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={onDeleteCourse}
                                disabled={!canDelete}
                                className="flex items-center gap-2"
                            >
                                {isDeleting && <IconLoader2 className="size-5 animate-spin" />}
                                {isDeleting ? "Apagando..." : "Apagar"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </form>
    );
}
