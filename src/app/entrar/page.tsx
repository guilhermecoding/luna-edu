import { randomInt } from "node:crypto";
import Image from "next/image";
import LoginForm from "./_components/login-form";
import GibbyAnimate from "@/components/gibby-animate";
import CorporationLogo from "@/app/entrar/_components/corporation-logo";
import CurrentYear from "@/app/entrar/_components/current-year";
import thumb01 from "@/assets/images/thumbs-login-page/Imagem_01.webp";
import thumb02 from "@/assets/images/thumbs-login-page/Imagem_02.webp";
import thumb03 from "@/assets/images/thumbs-login-page/Imagem_03.webp";
import thumb04 from "@/assets/images/thumbs-login-page/Imagem_04.webp";
import thumb05 from "@/assets/images/thumbs-login-page/Imagem_05.webp";
import thumb06 from "@/assets/images/thumbs-login-page/Imagem_06.webp";
import thumb07 from "@/assets/images/thumbs-login-page/Imagem_07.webp";
import thumb08 from "@/assets/images/thumbs-login-page/Imagem_08.webp";
import thumb09 from "@/assets/images/thumbs-login-page/Imagem_09.webp";
import { connection } from "next/server";

const loginThumbs = [thumb01, thumb02, thumb03, thumb04, thumb05, thumb06, thumb07, thumb08, thumb09];

export default async function LoginPage() {
    const logoCorporation = process.env.NEXT_PUBLIC_LOGO_CORPORATION;
    await connection();
    const randomThumb = loginThumbs[randomInt(loginThumbs.length)];

    return (
        <main className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-surface">
            {/* Lado Esquerdo - Imagem (Escondido em Mobile) */}
            <div className="hidden lg:block relative overflow-hidden pointer-events-none">
                <Image src={randomThumb} alt="Background" fill sizes="50vw" className="object-cover" priority />
            </div>

            {/* Lado Direito - Formulário */}
            <div className="flex w-full flex-col items-center justify-center">
                <div className="w-full space-y-4">
                    {/* Header */}
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="flex flex-col items-center gap-2">
                            <div className="flex flex-row items-center gap-2">
                                <GibbyAnimate className="size-24" />
                                <CorporationLogo logoCorporation={logoCorporation} />
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
                        &copy; <CurrentYear /> Luna Academy. Todos os direitos reservados.
                    </p>
                </div>
            </div>
        </main>
    );
}