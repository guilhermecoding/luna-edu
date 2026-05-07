"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useForm, type SubmitHandler, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { createCampusAction } from "../actions";
import { createCampusSchema, type CreateCampusInput } from "../schema";
import { IconLoader2 } from "@tabler/icons-react";
import { isRedirectError } from "@/lib/is-redirect-error";
import autoSlug from "@/lib/auto-slug";

export function CreateCampusForm() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const form = useForm<CreateCampusInput>({
        resolver: zodResolver(createCampusSchema),
        mode: "onChange",
        defaultValues: {
            name: "",
            address: "",
            slug: "",
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
    const canSubmit = isValid && isDirty && !isSubmitting && Boolean(nameValue?.trim()) && Boolean(slugValue?.trim());

    useEffect(() => {
        clearErrors();
        reset();
    }, [clearErrors, reset]);

    const onSubmit: SubmitHandler<CreateCampusInput> = async (data) => {
        clearErrors("root");

        try {
            const result = await createCampusAction(data);
            if (result?.success === false) {
                const params = new URLSearchParams(searchParams.toString());
                params.set("toast", "error");
                params.set("message", result.error || "Erro ao criar instituição");
                router.replace(`${pathname}?${params.toString()}`, { scroll: false });

                setError("root", {
                    type: "server",
                    message: result.error || "Erro ao criar instituição",
                });
                return;
            }
        } catch (error) {
            if (isRedirectError(error)) {
                throw error;
            }

            const params = new URLSearchParams(searchParams.toString());
            params.set("toast", "error");
            params.set("message", "Erro fatal ao criar instituição");
            router.replace(`${pathname}?${params.toString()}`, { scroll: false });

            setError("root", {
                type: "server",
                message: "Erro fatal ao criar instituição",
            });
        }
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {errors.root?.message && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-900 text-sm">
                    {errors.root.message}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="name">Nome da Instituição *</Label>
                    <Input
                        id="name"
                        placeholder="Ex: Campus Central"
                        {...register("name")}
                        disabled={isSubmitting}
                        aria-invalid={errors.name ? "true" : "false"}
                        className="p-5 rounded-lg bg-background"
                    />
                    {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
                </div>

                <div className="space-y-2 md:col-span-1">
                    <Label htmlFor="slug">Slug *</Label>
                    <div className="flex gap-2">
                        <Input
                            id="slug"
                            placeholder="Ex: campus-central"
                            {...register("slug")}
                            disabled={isSubmitting}
                            aria-invalid={errors.slug ? "true" : "false"}
                            className="p-5 rounded-lg bg-background flex-1"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            className="text-sm p-4 bg-black text-white dark:bg-white dark:text-black mt-0.5"
                            onClick={() => {
                                const newSlug = autoSlug(nameValue);
                                if (newSlug) {
                                    setValue("slug", newSlug, {
                                        shouldDirty: true,
                                        shouldTouch: true,
                                        shouldValidate: true,
                                    });
                                }
                            }}
                            disabled={isSubmitting || !nameValue}
                        >
                            Auto
                        </Button>
                    </div>
                    {errors.slug && <p className="text-sm text-red-600">{errors.slug.message}</p>}
                    <p className="text-xs text-muted-foreground italic">O slug será usado na URL e não poderá ser alterado depois.</p>
                </div>

                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Endereço *</Label>
                    <Input
                        id="address"
                        placeholder="Ex: Av. Principal, 1000"
                        {...register("address")}
                        disabled={isSubmitting}
                        className="p-5 rounded-lg bg-background"
                    />
                    {errors.address && <p className="text-sm text-red-600">{errors.address.message}</p>}
                </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end pt-4 border-t">
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
                    {isSubmitting ? "Salvando..." : "Criar Instituição"}
                </Button>
            </div>
        </form>
    );
}
