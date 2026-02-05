PROJECT STATE — HOME-AI-WEB
1) Visão geral

Nome do app: Home AI

Tipo: Web App (MVP)

Objetivo: Usuário envia uma foto de um cômodo e gera variações realistas de design de interiores com IA.

Status atual: MVP funcional em produção com login + gallery persistente (Supabase) + room type + limite diário Free (cost protection) + páginas legais (support/privacy/terms) + integração Stripe (Checkout + Billing Portal + Webhook) pronta.

2) Produção / Links

Repositório (GitHub): ebf2027/home-ai-web

Produção (Vercel): home-ai-web-2 (único projeto mantido)

URL de produção: https://home-ai-web-2.vercel.app

3) Stack / Tecnologias

Framework: Next.js (App Router)

Linguagem: TypeScript

UI: Tailwind CSS

Auth/DB/Storage: Supabase

Auth: Email+Senha e Google OAuth

DB: gallery_items (+ usage_daily) (+ profiles com flags de PRO)

Storage: bucket homeai

IA de imagem: OpenAI Images Edits via API Route

Payments: Stripe (Subscriptions)

Deploy: Vercel (deploy automático via GitHub)

4) Variáveis de ambiente
Local (.env.local)

Obrigatórias:

OPENAI_API_KEY=...

Supabase (públicas):

NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY=...

Supabase (server-side — recomendado também setar localmente):

SUPABASE_URL=https://xxxx.supabase.co (opcional, priorizado em app/lib/supabase/server.ts)

SUPABASE_ANON_KEY=... (opcional, priorizado em app/lib/supabase/server.ts)

SUPABASE_SERVICE_ROLE_KEY=... (necessário para supabaseAdmin no server, se você usar localmente)

Limites Free / Monetização:

FREE_DAILY_LIMIT=3 (default = 3 se não existir)

PRO_BYPASS_USER_IDS= (opcional, lista de UUIDs separados por vírgula para bypass do limite)

USAGE_TZ=America/Sao_Paulo (opcional; default America/Sao_Paulo)

Stripe (novas):

STRIPE_SECRET_KEY=sk_live_... (ou sk_test_... se estiver testando)

STRIPE_WEBHOOK_SECRET=whsec_...

STRIPE_PRICE_ID_PRO=price_...

APP_URL=https://home-ai-web-2.vercel.app (recomendado para URLs de retorno consistentes)

Vercel (Production Environment Variables)

Mesmas variáveis acima configuradas no projeto home-ai-web-2.

Importante: após mudar env vars, faça Redeploy (e se necessário desmarque “Use existing Build Cache”).

5) Rotas / Páginas principais (App Router)

/ → Home (upload + seleção de estilo + room type + gerar + salvar)
/gallery → Gallery (lista do usuário via Supabase)
/login → Login (Google + Email/Senha)
/profile → Profile
/upgrade → Upgrade (botão de assinar e botão de gerenciar assinatura via Stripe)
/support → Página de contato (email de suporte)
/privacy → Página de política de privacidade
/terms → Página de termos de serviço
/auth/callback → Callback do OAuth

APIs:

/api/generate → Geração com OpenAI + gate de limite diário Free

/api/stripe/checkout → Cria Checkout Session (subscription)

/api/stripe/portal → Cria sessão do Billing Portal (manage subscription)

/api/stripe/webhook → Webhook Stripe para ativar/desativar PRO no Supabase

/api/storage/cleanup → (se existir no projeto) endpoint de manutenção/limpeza

6) Fluxo de autenticação (Supabase)

O usuário acessa /login?next=/...
Pode autenticar via:

Google OAuth (signInWithOAuth)

Email + senha (signInWithPassword)

Signup (signUp) com confirmação por email (quando habilitado no Supabase)

Após login, o app redireciona para o next (default /).

Callback do OAuth: /auth/callback?code=...&next=...

Arquivos relevantes:

app/login/page.tsx

app/login/LoginClient.tsx

app/auth/callback/route.ts

app/lib/supabase/client.ts

app/lib/supabase/server.ts (async; precisa await createClient())

7) Fluxo de geração e salvamento (Home → OpenAI → Supabase)
Home (app/page.tsx)

Usuário escolhe imagem (Choose image)

Usuário escolhe Style

Usuário escolhe Room type (dropdown em inglês)

Clica Generate Design

App:

Otimiza a imagem para upload (prepareImageForUpload)

Faz POST /api/generate (FormData: style, roomType, image)

Recebe imagem final (blob jpeg) e gera thumbnail

Faz upload para Supabase Storage:

homeai/{userId}/{imageId}.jpg

homeai/{userId}/{imageId}-thumb.jpg

Cria registro no DB gallery_items com:

id, user_id, room_type, style, prompt, image_url, thumb_url, is_favorite

API de geração (app/api/generate/route.ts)

Ordem importante (cost protection):

Auth + checagem de limite diário Free (antes de chamar OpenAI)

Se permitido, chama OpenAI edits e retorna image/jpeg

Detalhes:

Recebe FormData: image, style, roomType

Normaliza style + roomType e monta prompt forte (preservar layout, portas/janelas etc.)

OpenAI: POST /v1/images/edits

Retorna image/jpeg

Config OpenAI:

model: gpt-image-1-mini

size: "auto", quality: "medium", output_format: "jpeg"

Retry em 429/5xx e timeout

8) Gallery (persistente)

Página: app/gallery/page.tsx + grid app/components/gallery/GalleryGrid.tsx

Busca itens do usuário via Supabase (DB + URLs do Storage)

Mostra cards com:

Thumb/Imagem

Room type

Style

Favoritar (star)

Download

Delete

Imagens antigas (antes do Room Type) continuam OK; daqui pra frente as novas já salvam room_type.

9) UI adicionada (recente)

Room Type (Home): dropdown entre estilos e botão de gerar, opções em inglês.

Photo tips (Home): modal com dicas (corrigida para não ficar atrás do bottom tabs).

Take photo + Upload (Home): dois botões; no mobile abre câmera via capture="environment".

10) Limite diário do Free (cost protection)

Objetivo:

Bloquear chamadas OpenAI quando o usuário Free atingir o limite diário.

Config:

FREE_DAILY_LIMIT (default 3)

PRO_BYPASS_USER_IDS (opcional)

USAGE_TZ (default America/Sao_Paulo)

Supabase:

Tabela public.usage_daily (PK: user_id, day, coluna count int)

RLS + policies para usuário ler/inserir/atualizar o próprio registro

RPC: public.check_and_bump_usage_daily(p_day date, p_limit int) retorna allowed, count, daily_limit

Backend (/api/generate):

await createSupabaseServerClient()

supabase.auth.getSession()

se não bypass: supabase.rpc("check_and_bump_usage_daily", { p_day, p_limit })

se bloqueado: 429 Daily free limit reached...

11) Stripe (assinatura Pro) — Implementado
Produto / Preço (Stripe)

Produto: Home Ai Pro

Recorrência: mensal

Preço: US$ 9,99 (definido no Stripe)

O app usa o STRIPE_PRICE_ID_PRO para criar a assinatura.

Fluxo no app

Página /upgrade:

Upgrade to Pro → chama /api/stripe/checkout e redireciona para Stripe Checkout

Manage subscription → chama /api/stripe/portal e abre Stripe Billing Portal

Observação: se o usuário ainda não tem stripe_customer_id, o portal pode retornar “No Stripe customer found yet.” (esperado antes da primeira compra)

Rotas Stripe (App Router)

app/api/stripe/checkout/route.ts

Cria/pega customer

Cria Checkout Session mode: "subscription"

Passa metadata.user_id e client_reference_id para reconciliar

Usa success_url/cancel_url com base em APP_URL ou host atual

app/api/stripe/portal/route.ts

Cria Billing Portal Session para o customer existente

return_url: ${baseUrl}/upgrade

app/api/stripe/webhook/route.ts

Valida assinatura via STRIPE_WEBHOOK_SECRET

Eventos tratados:

checkout.session.completed

customer.subscription.updated

customer.subscription.deleted

Atualiza profiles:

is_pro: true/false

stripe_customer_id

stripe_subscription_id

Lib Stripe

app/lib/stripe.ts

Exporta getStripe() (singleton) usando STRIPE_SECRET_KEY

Evita importar stripe como export inexistente (corrigido)

Supabase Admin

app/lib/supabase/admin.ts

Client server-side com service role para atualizar profiles via webhook e checkout.

Banco (profiles)

profiles precisa ter (ou foi adicionado):

is_pro boolean

stripe_customer_id text

stripe_subscription_id text

12) Páginas legais (implementadas)

/support → contato de suporte (email definido)

/privacy → política de privacidade

/terms → termos de serviço

Observação: foi necessário corrigir builds quando algum page.tsx não exportava componente (erro “is not a module”). Agora todas as páginas exportam corretamente.

13) Deploy / Workflow
Local

npm install

npm run dev

Testar:

login

geração

salvar no storage

aparecer na gallery

limite diário funcionando

/upgrade (checkout/portal em modo test ou live)

Produção (Vercel)

Push no GitHub dispara deploy automático:

git add .
git commit -m "..."
git push


Para mudanças em env vars no Vercel:

salvar variáveis

Redeploy

se necessário, desmarcar “Use existing Build Cache”

14) Problemas resolvidos (histórico rápido)

Supabase server client async exigia await createSupabaseServerClient()

RPC antiga com erro "count is ambiguous" → função recriada

Build Vercel: page.tsx is not a module → corrigido export nas páginas

Stripe:

import errado (import { stripe } ...) → padronizado para getStripe()

webhook/checkout/portal ajustados

endpoint live criado no Stripe Workbench

15) Próximos passos (próximos ~10 dias)
Monetização / Planos

Definir limite/mês do Pro com base no custo real por geração

Ajustar copy do plano (evitar “Unlimited” se houver limite)

Stripe / Produção

Confirmar que está usando LIVE keys + LIVE webhook

Testar compra real (ou teste) e verificar:

delivery do webhook

profiles.is_pro atualizado

portal funcionando após a primeira compra

Hardening

Melhorar mensagens de erro (OpenAI/Supabase/Stripe)

Rate limit adicional no /api/generate

Mostrar consumo diário (uso)

Marketing

Landing simples + demo + CTA

Analytics básico (Vercel Analytics ou alternativa)