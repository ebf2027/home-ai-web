'use client';
import { useEffect } from 'react';
import { createClient } from '../lib/supabase/client';

export function WelcomeTrigger() {
    useEffect(() => {
        const checkAndSendWelcome = async () => {
            const supabase = createClient();

            // 1. Pega o usuário logado
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                console.log("Trigger: Nenhum usuário logado ainda.");
                return;
            }

            // 2. Busca o perfil apenas para ver se o email já foi enviado (sem pedir o full_name que não existe)
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('welcome_sent')
                .eq('id', user.id)
                .single();

            if (error) {
                console.error("Trigger: Erro ao buscar perfil:", error);
                return;
            }

            // 3. Se o e-mail ainda não foi enviado
            if (profile && !profile.welcome_sent) {
                console.log("Trigger: Iniciando envio do e-mail de boas-vindas...");
                
                // Tenta pegar o nome direto do Google (se existir) ou usa o padrão
                const rawName = user.user_metadata?.full_name || user.user_metadata?.name || 'Premium Member';
                const firstName = rawName.split(' ')[0];
                
                try {
                    const response = await fetch('/api/send-welcome', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            email: user.email,
                            firstName: firstName,
                        }),
                    });

                    if (response.ok) {
                        // 4. Marca no banco que já foi enviado
                        await supabase
                            .from('profiles')
                            .update({ welcome_sent: true })
                            .eq('id', user.id);

                        console.log("Trigger: E-mail enviado e registrado com sucesso!");
                    } else {
                        const errorData = await response.json();
                        console.error("Trigger: Falha na API de e-mail:", errorData);
                    }
                } catch (err) {
                    console.error("Trigger: Erro crítico ao chamar API:", err);
                }
            } else {
                console.log("Trigger: E-mail já foi enviado anteriormente ou perfil não encontrado.");
            }
        };

        checkAndSendWelcome();
    }, []);

    return null;
}