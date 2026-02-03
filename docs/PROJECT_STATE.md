PROJECT STATE — HOME-AI-WEB
1) Visão geral

Nome do app: Home AI

Tipo: Web App (MVP)

Objetivo: Usuário envia uma foto de um cômodo e gera variações realistas de design de interiores com IA.

Status atual: MVP funcional em produção com login + gallery persistente no Supabase + room type + limite diário Free (cost protection).

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

DB: tabela gallery_items

Storage: bucket homeai

Nova feature: controle de uso diário (tabela usage_daily + RPC)

IA de imagem: OpenAI Images Edits via API Route

Deploy: Vercel

4) Variáveis de ambiente
Local (.env.local)

Obrigatórias:

OPENAI_API_KEY=...

Supabase (públicas):

NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY=...

Supabase (server-side — recomendado também setar localmente):

SUPABASE_URL=https://xxxx.supabase.co (opcional, mas priorizado em app/lib/supabase/server.ts)

SUPABASE_ANON_KEY=... (opcional, mas priorizado em app/lib/supabase/server.ts)

Limites Free / Monetização (novas):

FREE_DAILY_LIMIT=3 (default = 3 se não existir)

PRO_BYPASS_USER_IDS= (opcional, lista de UUIDs separados por vírgula para “bypass” do limite)

USAGE_TZ=America/Sao_Paulo (opcional; default = America/Sao_Paulo para contar “dia” no fuso correto)

Vercel (Production Environment Variables)

Mesmas variáveis acima configuradas no projeto home-ai-web-2.

Importante: NEXT_PUBLIC_SUPABASE_URL precisa ser uma URL válida HTTP/HTTPS (ex.: https://...supabase.co).

5) Rotas / Páginas principais (App Router)

/ → Home (upload + seleção de estilo + room type + gerar + salvar)

/gallery → Gallery (lista do usuário via Supabase)

/login → Login (Google + Email/Senha)

/profile → Profile

/upgrade → Upgrade (placeholder/fluxo futuro)

/auth/callback → Callback do OAuth (troca code → session e redireciona para next)

/api/generate → Geração com OpenAI (edits) + gate de limite diário Free

/api/storage/cleanup → (existe no projeto) endpoint de manutenção/limpeza (se aplicável)

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

Usuário escolhe imagem (Choose image).

Usuário escolhe Style.

Usuário escolhe Room type (dropdown em inglês).

Clica Generate Design.

App:

Otimiza a imagem para upload (prepareImageForUpload)

Faz POST /api/generate (FormData: style, roomType, image)

Recebe imagem final (blob jpeg)

Gera thumbnail (jpeg)

Faz upload para Supabase Storage:

homeai/{userId}/{imageId}.jpg

homeai/{userId}/{imageId}-thumb.jpg

Cria registro no Supabase DB em gallery_items com:

id, user_id, room_type, style, prompt, image_url, thumb_url, is_favorite

API de geração (app/api/generate/route.ts)

Ordem importante (cost protection):

Auth + checagem de limite diário (antes de chamar OpenAI)

Se permitido, continua com geração (OpenAI edits)

Detalhes:

Recebe FormData: image, style, roomType

Normaliza style + roomType e monta prompt forte:

preservar layout, portas/janelas, câmera etc.

Chama OpenAI: POST https://api.openai.com/v1/images/edits

Retorna image/jpeg no response

Config OpenAI:

Model atual: gpt-image-1-mini

size: "auto", quality: "medium", output_format: "jpeg"

Retry para status temporários (429/5xx) e timeout

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

As imagens antigas (antes do Room Type) não precisam ser alteradas. Daqui pra frente todas as novas já salvam room_type.

9) UI adicionada (recente)
Room Type (Home)

Dropdown entre estilos e botão de geração.

Opções em inglês (ex.: Living room, Bedroom, Kitchen, …).

roomType vai para o prompt e é salvo no DB como label.

“Photo tips” (Home)

Ajuda para o usuário tirar uma foto melhor.

Abre uma modal com lista de dicas (em inglês).

Ajustada para não ficar escondida atrás do bottom tabs (modal scrollável / padding bottom / z-index).

Take photo + Upload (Home): implementado com dois botões; no mobile abre câmera diretamente via capture="environment".

10) Limite diário do Free (implementado hoje)
Objetivo

Proteger custos: bloquear chamadas OpenAI quando o usuário Free atingir o limite diário.

Limite configurável por env: FREE_DAILY_LIMIT (default 3).

Bypass opcional por env: PRO_BYPASS_USER_IDS (UUIDs separados por vírgula).

Dia contado no fuso USAGE_TZ (default America/Sao_Paulo).

Banco (Supabase)

Criado:

Tabela: public.usage_daily

PK: (user_id, day)

Coluna count (int)

RLS habilitado + policies para o usuário ler/inserir/atualizar o próprio registro.

RPC criada e corrigida:

Função: public.check_and_bump_usage_daily(p_day date, p_limit int)

Retorno: allowed boolean, count int, daily_limit int

Comportamento:

garante linha do dia (insert on conflict)

faz lock (for update)

se count < limit: incrementa e retorna allowed=true

se atingiu: retorna allowed=false

Backend (route.ts)

Em POST /api/generate:

cria Supabase server client via await createSupabaseServerClient() (server.ts é async)

pega sessão: supabase.auth.getSession()

se não logado: 401

se não bypass: chama supabase.rpc("check_and_bump_usage_daily", { p_day, p_limit })

se não allowed: 429 com mensagem “Daily free limit reached…”

se allowed: segue para OpenAI normalmente

11) Deploy / Workflow
Local

npm install

npm run dev

testar:

login

geração

salvar no storage

aparecer na gallery

limite diário Free funcionando

Produção (Vercel)

Push no GitHub dispara deploy automático:

git add .

git commit -m "..."

git push

Para mudanças em env vars no Vercel: após ajustar, fazer Redeploy (e se necessário desmarcar “Use existing Build Cache”).

12) Problemas resolvidos (histórico rápido)

Erro em produção: Cannot read properties of undefined (reading 'getSession')

Causa: app/lib/supabase/server.ts exporta createClient() async, então precisava await createSupabaseServerClient().

Erro RPC/SQL: "column reference 'count' is ambiguous"

Causa: conflito/ambiguidade na função SQL antiga.

Solução: recriar a função check_and_bump_usage_daily com retorno e lógica corrigidos.

Diferença local vs Vercel:

Ajustes de env vars e redeploy garantiram consistência.

13) Próximos passos (para finalizar em ~10 dias)

Limites / Monetização

Definir plano Free vs Pro (ex.: limite diário, estilos premium, resolução).

Implementar paywall no /upgrade.

Pagamento

Integrar Stripe (assinatura / lifetime).

Hardening

Melhorar mensagens de erro (OpenAI/Supabase).

Rate limit / proteção no /api/generate.

UX

Melhor “empty state” e microcopys.

Mostrar consumo de créditos (uso diário).

Legal/Produto

Terms / Privacy / contato

Analytics básico (Vercel Analytics ou alternativa)

Marketing

Landing simples, demo images, CTA claro