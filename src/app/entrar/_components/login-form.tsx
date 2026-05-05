"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { IconLogin2, IconUserShield, IconSchool, IconLoader2 } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import type { SessionUser } from "@/@types/session-type";

const loginSchema = z.object({
    email: z.string().email("Este e-mail não é válido"),
    password: z.string().min(8, "A senha deve ter ao menos 8 caracteres"),
});
type LoginInput = z.infer<typeof loginSchema>;

const emptyLoginValues: LoginInput = {
    email: "",
    password: "",
};

type SessionUserLogin = Omit<SessionUser, "id">;
/**
 * Aba Professor: somente quem tem vínculo `isTeacher` no cadastro (inclui admin que também é professor).
 * Aba Admin: somente quem tem vínculo `isAdmin` no cadastro.
 */
function sessionMatchesTab(activeTab: "admin" | "teacher", user: SessionUserLogin): boolean {
    if (activeTab === "teacher") {
        return user.isTeacher === true;
    }
    return user.isAdmin === true;
}

export default function LoginForm() {
    const router = useRouter();
    const pathname = usePathname();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<"admin" | "teacher">("teacher");

    const {
        control,
        handleSubmit,
        reset,
        formState: { isValid, errors },
    } = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
        mode: "onChange",
        defaultValues: emptyLoginValues,
    });

    useEffect(() => {
        reset(emptyLoginValues);
        setActiveTab("teacher");
    }, [pathname, reset]);

    // ---------------------
    // SUBMIT DO LOGIN
    // ---------------------
    async function onSubmit(values: LoginInput) {
        setLoading(true);
        try {
            const { error } = await authClient.signIn.email({
                email: values.email,
                password: values.password,
            });

            if (error) {
                toast.error("Usuário não encontrado", {
                    description: "Ops! Não sabemos quem é você... Talvez suas credenciais estejam inválidas. Tente novamente.",
                });
                return;
            }

            const sessionRes = await fetch("/api/auth/get-session", {
                credentials: "include",
                cache: "no-store",
            });
            const sessionBody = sessionRes.ok ? await sessionRes.json() : null;
            const user =
                sessionBody &&
                typeof sessionBody === "object" &&
                "user" in sessionBody &&
                sessionBody.user &&
                typeof sessionBody.user === "object"
                    ? (sessionBody.user as SessionUserLogin)
                    : null;

            if (!user) {
                await authClient.signOut();
                toast.error("Não foi possível validar o perfil", {
                    description: "Tente novamente em instantes.",
                });
                return;
            }

            if (!sessionMatchesTab(activeTab, user)) {
                await authClient.signOut();
                toast.error("Usuário não encontrado", {
                    description: "Ops! Não sabemos quem é você... Talvez suas credenciais estejam inválidas. Tente novamente.",
                });
                return;
            }

            const firstName = user.name?.trim().split(" ")[0] || "usuário";
            toast.success(`Bem vindo(a) de volta, ${firstName}!`);

            router.push(activeTab === "admin" ? "/admin" : "/prof");
            router.refresh();
        } catch {
            toast.error("Erro inesperado", {
                description: "Ocorreu um problema do nosso lado. Tente novamente em instantes.",
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="w-full px-3 sm:px-0 sm:w-3/5 space-y-6">
            {/* TABS CUSTOMIZADAS */}
            <div className="flex p-1 bg-muted-foreground/10 rounded-xl border border-border/50">
                <button
                    type="button"
                    onClick={() => setActiveTab("teacher")}
                    className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-all",
                        activeTab === "teacher"
                            ? "bg-background text-primary shadow-sm"
                            : "text-muted-foreground hover:text-foreground",
                    )}
                >
                    <IconSchool className="w-4 h-4" />
                    Professor
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab("admin")}
                    className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-all",
                        activeTab === "admin"
                            ? "bg-background text-primary shadow-sm"
                            : "text-muted-foreground hover:text-foreground",
                    )}
                >
                    <IconUserShield className="w-4 h-4" />
                    Administrador
                </button>
            </div>

            <form
                onSubmit={handleSubmit(onSubmit)}
                className="w-full space-y-5"
            >
                {/* EMAIL */}
                <div className="w-full space-y-2">
                    <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                        E-mail
                    </Label>
                    <Controller
                        name="email"
                        control={control}
                        render={({ field }) => (
                            <Input
                                {...field}
                                id="email"
                                type="email"
                                placeholder={activeTab === "admin" ? "admin@luna.com" : "professor@luna.com"}
                                className={cn(
                                    "h-12 rounded-xl border-2 px-4 outline-none transition-all focus:ring-0 bg-background",
                                    errors.email ? "border-destructive focus:border-destructive" : "border-foreground/20 focus:border-primary",
                                )}
                            />
                        )}
                    />
                    {errors.email && (
                        <p className="text-xs font-medium text-destructive ml-1">{errors.email.message}</p>
                    )}
                </div>

                {/* SENHA */}
                <div className="w-full space-y-2">
                    <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                        Senha
                    </Label>
                    <Controller
                        name="password"
                        control={control}
                        render={({ field }) => (
                            <Input
                                {...field}
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                className={cn(
                                    "h-12 rounded-xl border-2 px-4 outline-none transition-all focus:ring-0 bg-background",
                                    errors.password ? "border-destructive focus:border-destructive" : "border-foreground/20 focus:border-primary",
                                )}
                            />
                        )}
                    />
                    {errors.password && (
                        <p className="text-xs font-medium text-destructive ml-1">{errors.password.message}</p>
                    )}
                </div>

                {/* BOTÃO */}
                <div className="pt-2">
                    <Button
                        type="submit"
                        className="w-full h-14 font-bold transition-all hover:scale-[1.01] active:scale-[0.99]"
                        disabled={!isValid || loading}
                        aria-busy={loading}
                    >
                        {loading ? (
                            <>
                                <IconLoader2 className="animate-spin size-6" />
                                Um momento...
                            </>
                        ) : (
                            <>
                                <IconLogin2 className="size-6" />
                                Entrar
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}