import { Resend } from "resend";
import WelcomeMemberEmail from "@/emails/welcome-member";

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.EMAIL_FROM || "Gibby - Luna Academy <gibby@luna.guilhermecoding.com>";
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
    // Evita crashar o sistema se esquecer de colocar a chave de API no .env
    if (!process.env.RESEND_API_KEY) {
        console.warn(`[Mail] Variável de ambiente não configurada. E-mail de boas-vindas não enviado para ${email}.`);
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
