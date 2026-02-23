"use client";
import { useEffect } from "react";

export function ReferralTracker() {
    useEffect(() => {
        const checkReferral = async () => {
            // Procura na memória secreta se tem algum código guardado
            const referrerId = localStorage.getItem("homerenovai_ref");
            if (!referrerId) return; // Se não tiver, não faz nada e fica invisível

            try {
                // Se tiver, chama o robô que acabamos de criar
                const res = await fetch("/api/referral", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ referrerId }),
                });

                if (res.ok) {
                    // A recompensa foi paga! Apaga da memória para não dar crédito duplicado
                    localStorage.removeItem("homerenovai_ref");
                }
            } catch (e) {
                console.error("Erro ao processar indicação", e);
            }
        };

        // Espera 2 segundos após o aplicativo abrir para garantir que o login completou
        setTimeout(checkReferral, 2000);
    }, []);

    return null; // É um componente 100% invisível na tela
}