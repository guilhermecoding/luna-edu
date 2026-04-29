"use client";

import { useState } from "react";
import Image from "next/image";
import LoginForm from "./_components/login-form";
import GibbyAnimate from "@/components/gibby-animate";

export default function LoginPage() {
    const logoCorporation = process.env.NEXT_PUBLIC_LOGO_CORPORATION;
    const [showCorporationLogo, setShowCorporationLogo] = useState(Boolean(logoCorporation));
    return (
        <main className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-surface">
            {/* Lado Esquerdo - Imagem (Escondido em Mobile) */}
            <div className="hidden lg:block relative overflow-hidden">
                <Image
                    src="/thumb.jpg"
                    alt="Background"
                    fill
                    className="object-cover"
                    priority
                />
            </div>

            {/* Lado Direito - Formulário */}
            <div className="flex w-full flex-col items-center justify-center">
                <div className="w-full space-y-4">
                    {/* Header */}
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="flex flex-col items-center gap-2">
                            <div className="flex flex-row items-center gap-2">
                                <GibbyAnimate className="size-24" />
                                {showCorporationLogo && logoCorporation && (
                                    <>
                                        <span className="text-4xl font-bold text-muted-foreground mt-4 mr-2">+</span>
                                        <Image
                                            src={logoCorporation}
                                            alt="Logo"
                                            width={100}
                                            height={100}
                                            className="size-20 object-contain mt-3"
                                            onError={() => setShowCorporationLogo(false)}
                                        />
                                    </>
                                )}
                            </div>
                            <h2 className="font-silkscreen text-primary-theme text-6xl">LUNA</h2>
                        </div>
                        <div className="space-y-1">
                            <p className="text-muted-foreground text-lg font-medium">
                                Bem-vindo(a) de volta!
                            </p>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="p-6 flex justify-center items-center">
                        <LoginForm />
                    </div>

                    {/* Footer opcional */}
                    <p className="text-center text-xs text-muted-foreground">
                        &copy; {new Date().getFullYear()} Luna Academy. Todos os direitos reservados.
                    </p>
                </div>
            </div>
        </main>
    );
}