import { Resend } from 'resend';
import { getWelcomeEmailHtml } from '@/emails/WelcomeEmail';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
    try {
        const { email, firstName } = await request.json();
        console.log("Tentando enviar e-mail para:", email);

        // Agora pegamos o HTML direto da função, sem precisar de 'render'
        const emailHtml = getWelcomeEmailHtml(firstName);

        const { data, error } = await resend.emails.send({
            from: 'HomeRenovAi <hello@homerenovai.com>',
            to: [email],
            subject: 'Welcome to HomeRenovAi! ✨',
            html: emailHtml,
        });

        if (error) {
            console.error("Erro do Resend:", error);
            return NextResponse.json({ error }, { status: 500 });
        }

        console.log("E-mail enviado com sucesso! ID:", data?.id);
        return NextResponse.json({ data });
    } catch (error: any) {
        console.error("Erro crítico na API:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}