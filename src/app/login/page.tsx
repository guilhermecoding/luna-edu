import Image from "next/image";
import LoginForm from "./_components/login-form";

export default function LoginPage() {
    return (
        <main className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background">
            {/* Lado Esquerdo - Imagem (Escondido em Mobile) */}
            <div className="hidden lg:block relative overflow-hidden">
                <Image
                    src="/thunb-login.webp"
                    alt="Background"
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-primary/20 backdrop-blur-[2px]" />
            </div>

            {/* Lado Direito - Formulário */}
            <div className="flex flex-col items-center justify-center p-8 sm:p-12 lg:p-20">
                <div className="w-full max-w-100 space-y-8">
                    {/* Header */}
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="relative w-48 h-16">
                            <Image
                                src="/logo.svg"
                                alt="Luna Academy"
                                fill
                                className="object-contain"
                            />
                        </div>
                        <div className="space-y-1">
                            <h1 className="text-2xl font-bold tracking-tight">Bem-vindo de volta</h1>
                            <p className="text-muted-foreground text-sm">
                                Escolha seu perfil e acesse sua conta
                            </p>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="bg-card p-6 rounded-3xl border border-border/50 shadow-sm">
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