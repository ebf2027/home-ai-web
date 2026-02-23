import { NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/server";
import { supabaseAdmin } from "@/app/lib/supabase/admin";

export async function POST(req: Request) {
    try {
        // 1. Recebe o código do amigo que estava na memória do navegador
        const { referrerId } = await req.json();

        // 2. Confirma quem é o usuário novo que acabou de fazer login
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        // Se não tiver ninguém logado, ou se a pessoa clicou no próprio link, bloqueia
        if (!user || !referrerId || user.id === referrerId) {
            return NextResponse.json({ message: "Inválido" }, { status: 400 });
        }

        // 3. Tenta salvar o registro na tabela "referrals" do seu Supabase
        // O Supabase bloqueia automaticamente se esse usuário novo já foi indicado antes
        const { error: refError } = await supabaseAdmin
            .from("referrals")
            .insert({ referrer_id: referrerId, referred_id: user.id });

        if (refError) {
            return NextResponse.json({ message: "Já indicado anteriormente" }, { status: 400 });
        }

        // 4. Se deu tudo certo, pega os créditos atuais do amigo que indicou
        const { data: currentCredits } = await supabaseAdmin
            .from("user_credits")
            .select("free_base")
            .eq("user_id", referrerId)
            .single();

        if (currentCredits) {
            // 5. Deposita a recompensa! Dá +1 crédito base para ele
            await supabaseAdmin
                .from("user_credits")
                .update({ free_base: currentCredits.free_base + 1 })
                .eq("user_id", referrerId);
        }

        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ message: "Erro interno" }, { status: 500 });
    }
}