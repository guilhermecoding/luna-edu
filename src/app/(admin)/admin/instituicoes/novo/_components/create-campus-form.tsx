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
        },
    });

    const {
        register,
        control,
        formState: { errors, isSubmitting, isValid, isDirty },
        setError,
        clearErrors,
        reset,
    } = form;

    const nameValue = useWatch({ control, name: "name" });
    const canSubmit = isValid && isDirty && !isSubmitting;

    useEffect(() => {
        clearErrors();
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
                        className="p-5 h-[62px] rounded-lg bg-background"
                    />
                    {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
                </div>

                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Endereço *</Label>
                    <Input
                        id="address"
                        placeholder="Ex: Av. Principal, 1000"
                        {...register("address")}
                        disabled={isSubmitting}
                        className="p-5 h-[62px] rounded-lg bg-background"
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
