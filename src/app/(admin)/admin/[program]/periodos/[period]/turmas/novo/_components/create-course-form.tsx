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
import { useForm, type SubmitHandler, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Fragment, useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import { createCourseAction } from "../actions";
import { courseSchema, type CourseInput, SHIFTS, shiftLabels } from "../../schema";
import { IconBuilding, IconLoader2, IconUsers } from "@tabler/icons-react";
import { isRedirectError } from "@/lib/is-redirect-error";

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

interface CreateCourseFormProps {
    programSlug: string;
    periodSlug: string;
    subjects: SubjectWithDegree[];
    rooms: RoomWithCampus[];
}

export function CreateCourseForm({ programSlug, periodSlug, subjects, rooms }: CreateCourseFormProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const form = useForm<CourseInput>({
        resolver: zodResolver(courseSchema),
        mode: "onChange",
        defaultValues: {
            name: "",
            subjectId: undefined,
            roomId: undefined,
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
    const canSubmit = isValid && isDirty && !isSubmitting && Boolean(nameValue?.trim());

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
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-900 text-sm">
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

                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="subjectId">Disciplina *</Label>
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
                                    className="p-5 rounded-lg bg-background"
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
                                    className="p-5 rounded-lg bg-background"
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
                    <Label htmlFor="roomId">Sala *</Label>
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
                                    className="p-5 rounded-lg bg-background"
                                    aria-invalid={errors.roomId ? "true" : "false"}
                                >
                                    <SelectValue placeholder="Selecione uma sala" />
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
                                                        <div className="flex flex-col gap-0.5 py-1">
                                                            <span className="font-semibold text-sm">{room.name}</span>
                                                            <div className="flex flex-wrap gap-2 mt-1">
                                                                <div className="flex items-center gap-1 bg-muted px-2 py-0.5 rounded-md text-[10px] text-muted-foreground border border-surface-border">
                                                                    <IconBuilding className="size-3" />
                                                                    <span>Bloco {room.block || "S/B"}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1 bg-muted px-2 py-0.5 rounded-md text-[10px] text-muted-foreground border border-surface-border">
                                                                    <IconUsers className="size-3" />
                                                                    <span>{Number(room.capacity)} vagas</span>
                                                                </div>
                                                            </div>
                                                        </div>
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
