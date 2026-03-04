'use client';
import { useEffect } from 'react';
import { createClient } from '@/utils/supabase/client'; // Ajuste o caminho se necessário

export function WelcomeTrigger() {
    const supabase = createClient();

    useEffect(() => {
        const checkAndSendWelcome = async () => {
            // 1. Pega o usuário logado
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // 2. Busca o perfil dele para ver se já enviamos o e-mail
            const { data: profile } = await supabase
                .from('profiles')
                .select('full_name, welcome_sent')
                .eq('id', user.id)
                .single();

            // 3. Se ele não recebeu ainda, dispara o gatilho!
            if (profile && !profile.welcome_sent) {
                try {
                    const response = await fetch('/api/send-welcome', {
                        method: 'POST',
                        body: JSON.stringify({
                            email: user.email,
                            firstName: profile.full_name?.split(' ')[0] || 'Friend',
                        }),
                    });

                    if (response.ok) {
                        // 4. Marca no banco que já foi enviado com sucesso
                        await supabase
                            .from('profiles')
                            .update({ welcome_sent: true })
                            .eq('id', user.id);

                        console.log("Welcome email sent and recorded!");
                    }
                } catch (error) {
                    console.error("Error sending welcome email:", error);
                }
            }
        };

        checkAndSendWelcome();
    }, [supabase]);

    return null; // Ele não renderiza nada na tela, trabalha nos bastidores
}