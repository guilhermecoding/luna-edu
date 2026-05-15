import { Resend } from "resend";
import WelcomeMemberEmail from "@/emails/welcome-member";

// Instancia o Resend apenas se a chave estiver presente, evitando quebra no build
const getResend = () => {
    const key = process.env.RESEND_API_KEY;
    if (!key) return null;
    return new Resend(key);
};

const fromEmail = process.env.EMAIL_FROM || "Gibby - Luna Edu <noreply@luna.edu.br>";
const systemUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

interface SendWelcomeEmailParams {
    email: string;
    name: string;
    password?: string;
    roleName: string;
}

export async function sendWelcomeEmail({
    email,
    name,
    password,
    roleName,
}: SendWelcomeEmailParams) {
    const resend = getResend();

    if (!resend) {
        console.warn(`[Mail] RESEND_API_KEY não configurada. E-mail de boas-vindas não enviado para ${email}.`);
        return { success: false, error: "API Key missing" };
    }

    try {
        const data = await resend.emails.send({
            from: fromEmail,
            to: email,
            subject: `Gibby aqui! Suas credenciais de ${roleName} chegaram 🔓`,
            react: WelcomeMemberEmail({
                userName: name,
                userEmail: email,
                userPassword: password,
                roleName,
                systemUrl,
            }),
        });

        return { success: true, data };
    } catch (error) {
        console.error("[Mail] Falha ao enviar e-mail de boas-vindas:", error);
        return { success: false, error };
    }
}
