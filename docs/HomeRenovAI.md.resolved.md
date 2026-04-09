# 🏠 HomeRenovAI — Documentação Completa do Projeto

> **Aplicação de design de interiores e exteriores baseada em Inteligência Artificial.**
> Permite ao usuário transformar fotos de cômodos e fachadas em diferentes estilos decorativos usando IA generativa.

---

## 📌 Informações Gerais

| Campo | Valor |
|---|---|
| **Nome do App** | HomeRenovAi |
| **Domínio Oficial** | https://homerenovai.com |
| **Versão Atual** | v2.4.0 |
| **Linguagem** | TypeScript (TSX) |
| **Framework** | Next.js 16.1.1 (App Router) |
| **UI Framework** | React 19.2.3 |
| **Estilização** | Tailwind CSS 4 + PostCSS |
| **Hospedagem** | Vercel |
| **Pasta do Projeto** | `home-ai-web` (mantida para preservar conexões de Deploy e Git) |

---

## 🎨 Identidade Visual

| Elemento | Valor |
|---|---|
| **Cor Primária (Fundo Dark)** | `#0A0A0A` |
| **Cor de Destaque (Dourado Premium)** | `#D4AF37` |
| **Modo de Tema** | Light / Dark (persistente via `localStorage`) |
| **Fonte Padrão** | Arial, Helvetica, sans-serif |
| **Layout Desktop** | "Big Screen Experience" — Painéis duplos, Dock flutuante estilo Mac |
| **Layout Mobile** | "App Nativo" — Elementos edge-to-edge, Bottom Tab Bar |

---

## 🛠️ Tech Stack Completa

### Dependências de Produção (`dependencies`)

| Pacote | Versão | Função |
|---|---|---|
| `next` | 16.1.1 | Framework full-stack (App Router, SSR, API Routes) |
| `react` | 19.2.3 | Biblioteca de UI reativa |
| `react-dom` | 19.2.3 | Renderização React no DOM |
| `@supabase/supabase-js` | ^2.93.1 | SDK principal do Supabase (Auth, DB, Storage) |
| `@supabase/ssr` | ^0.8.0 | Supabase para Server-Side Rendering (cookies, sessão) |
| `@fal-ai/client` | ^1.9.4 | SDK do fal.ai (motor de IA para geração de imagens) |
| `openai` | ^6.16.0 | SDK OpenAI (legado, substituído pelo fal.ai) |
| `stripe` | ^20.3.0 | SDK Stripe (pagamentos, assinaturas, webhooks) |
| `resend` | ^6.9.3 | SDK Resend (envio de e-mails transacionais) |
| [clsx](file:///c:/Users/Cliente/home-ai-web/app/components/BottomTabs.tsx#6-9) | ^2.1.1 | Utilitário para classes CSS condicionais |

### Dependências de Desenvolvimento (`devDependencies`)

| Pacote | Versão | Função |
|---|---|---|
| `tailwindcss` | ^4 | Framework CSS utility-first |
| `@tailwindcss/postcss` | ^4 | Plugin PostCSS para Tailwind |
| `typescript` | ^5 | Superset tipado de JavaScript |
| `@types/node` | ^20 | Tipos TypeScript para Node.js |
| `@types/react` | ^19 | Tipos TypeScript para React |
| `@types/react-dom` | ^19 | Tipos TypeScript para React DOM |
| `eslint` | ^9 | Linter de código |
| `eslint-config-next` | 16.1.1 | Configuração ESLint para Next.js |

---

## 🔌 Integrações Externas

### 1. Supabase (Backend-as-a-Service)
- **Autenticação:** Login com Google OAuth e Email/Senha com confirmação de e-mail
- **Banco de Dados (PostgreSQL):** Tabelas `profiles`, `user_credits`, `gallery_items`, `referrals`, `stripe_events`
- **Storage:** Bucket `homeai` para armazenamento de imagens geradas (full + thumbnails) e avatares de perfil
- **Clientes configurados:**
  - [client.ts](file:///c:/Users/Cliente/home-ai-web/app/lib/supabase/client.ts) — Browser client (SSR-compatible via `@supabase/ssr`)
  - [server.ts](file:///c:/Users/Cliente/home-ai-web/app/lib/supabase/server.ts) — Server client (cookies, Server Components/API Routes)
  - [admin.ts](file:///c:/Users/Cliente/home-ai-web/app/lib/supabase/admin.ts) — Service Role client (operações privilegiadas)

### 2. Stripe (Sistema de Pagamentos)
- **Checkout Session:** Criação de sessões de pagamento para planos Pro e Pro+
- **Billing Portal:** Gerenciamento de assinatura pelo cliente
- **Webhooks:** Processamento automático de eventos (`checkout.session.completed`, `customer.subscription.created/updated/deleted`)
- **Idempotência:** Tabela `stripe_events` para evitar processamento duplicado
- **Planos:**
  - **Free** — 3 créditos gratuitos
  - **Pro** — 100 créditos/mês
  - **Pro+** — 300 créditos/mês (marcado como "Best Value")
- **Regra de negócio:** Créditos **não são acumulativos** — resetam na renovação do ciclo

### 3. fal.ai (Motor de IA — Geração de Imagens)
- **Modelo:** `fal-ai/flux-kontext/dev` (Image-to-Image)
- **Parâmetros de qualidade:**
  - `num_inference_steps: 35`
  - `guidance_scale: 10` (interiores) / `13` (fachadas)
  - `output_format: "jpeg"`
- **Prompt inteligente:** Detecta automaticamente se o ambiente é interior ou fachada e ajusta os termos do prompt
- **Dicionário de estilos para fachadas:** Descrições detalhadas de materiais e arquitetura por estilo (Modern, Minimalist, Scandinavian, Japanese, Rustic, Industrial, Boho, Super Luxury)

### 4. Resend (E-mails Transacionais)
- **Domínio verificado:** `homerenovai.com` (autenticado via DNS na Vercel)
- **E-mail de boas-vindas:** Automatizado via [WelcomeTrigger](file:///c:/Users/Cliente/home-ai-web/app/components/WelcomeTrigger.tsx#5-53) component + API `/api/send-welcome`
- **Remetente:** `hello@homerenovai.com`
- **Reply-to:** Configurado para e-mail pessoal do proprietário

### 5. Vercel (Hospedagem & Deploy)
- **Deploy automático** via Git (push → build → deploy)
- **Environment Variables:** Todas as chaves de API configuradas no painel da Vercel

---

## 📁 Estrutura de Arquivos do Projeto

```
home-ai-web/
├── app/
│   ├── api/                          # API Routes (Server-side)
│   │   ├── credits/route.ts          # GET — Consulta de créditos do usuário
│   │   ├── generate/route.ts         # POST — Geração de imagem via fal.ai (341 linhas)
│   │   ├── referral/route.ts         # POST — Processamento de indicações
│   │   ├── send-welcome/route.ts     # POST — Envio de e-mail de boas-vindas (Resend)
│   │   ├── storage/cleanup/          # Limpeza de storage
│   │   └── stripe/
│   │       ├── checkout/route.ts     # POST — Criação de Checkout Session
│   │       ├── portal/route.ts       # POST — Criação de Billing Portal Session
│   │       └── webhook/route.ts      # POST — Receptor de webhooks Stripe (366 linhas)
│   │
│   ├── auth/
│   │   └── callback/route.ts         # GET — Callback OAuth (troca code por session)
│   │
│   ├── components/                   # Componentes React reutilizáveis
│   │   ├── BottomTabs.tsx            # Barra de navegação inferior (mobile, 4 tabs)
│   │   ├── ConditionalBottomBar.tsx  # Esconde BottomTabs nas páginas de login/signup
│   │   ├── CreditsBadge.tsx          # Badge de créditos restantes
│   │   ├── InstallButton.tsx         # Botão PWA "Instalar App" (Android/iOS)
│   │   ├── ReferralTracker.tsx       # Motor invisível de indicações
│   │   ├── ThemeProvider.tsx         # Contexto global Light/Dark mode
│   │   ├── WelcomeTrigger.tsx        # Gatilho de e-mail de boas-vindas
│   │   └── gallery/
│   │       ├── GalleryGrid.tsx       # Grid masonry de imagens
│   │       └── GalleryModal.tsx      # Modal de visualização ampliada
│   │
│   ├── lib/                          # Módulos utilitários
│   │   ├── galleryDb.ts              # CRUD da galeria (upload Storage + insert DB)
│   │   ├── galleryStorage.ts         # Galeria via localStorage (fallback/legacy)
│   │   ├── resolveImageSrc.ts        # Resolve URLs de imagens (base64 vs Storage)
│   │   ├── storageImages.ts          # Conversão de imagens (dataUrl→Blob, thumbnails)
│   │   ├── stripe.ts                 # Singleton do cliente Stripe (server-side)
│   │   └── supabase/
│   │       ├── admin.ts              # Cliente Admin (Service Role Key)
│   │       ├── client.ts             # Cliente Browser (Anon Key)
│   │       └── server.ts             # Cliente Server (cookies-based)
│   │
│   ├── types/
│   │   └── gallery.ts                # Tipagem TypeScript para GalleryItem
│   │
│   ├── login/page.tsx                # Página de Login (274 linhas)
│   ├── page.tsx                      # Página Home / Workspace (482 linhas)
│   ├── gallery/page.tsx              # Página da Galeria (375 linhas)
│   ├── profile/page.tsx              # Página de Perfil (509 linhas)
│   ├── upgrade/page.tsx              # Página de Upgrade/Planos (324 linhas)
│   ├── privacy/page.tsx              # Política de Privacidade
│   ├── terms/page.tsx                # Termos de Serviço
│   ├── support/page.tsx              # Página de Suporte
│   ├── layout.tsx                    # Layout raiz (ThemeProvider, PWA, BottomTabs)
│   ├── globals.css                   # CSS global (variáveis de tema)
│   └── favicon.ico                   # Ícone do site
│
├── emails/
│   └── WelcomeEmail.tsx              # Template HTML do e-mail de boas-vindas
│
├── public/
│   ├── manifest.json                 # Manifest PWA
│   ├── icon-192x192.png              # Ícone PWA 192x192
│   ├── icon-512x512.png              # Ícone PWA 512x512
│   ├── apple-touch-icon.png          # Ícone iOS
│   ├── examples/                     # Imagens de exemplo (carrossel)
│   └── styles/                       # Estilos estáticos
│
├── docs/
│   └── PROJECT_STATE.md              # Histórico completo do desenvolvimento
│
├── proxy.ts                          # Middleware de autenticação e proteção de rotas
├── package.json                      # Dependências e scripts
├── tsconfig.json                     # Configuração TypeScript
├── next.config.ts                    # Configuração Next.js
├── postcss.config.mjs                # Configuração PostCSS
├── eslint.config.mjs                 # Configuração ESLint
├── .env.local                        # Variáveis de ambiente (local)
└── .env.live.local                   # Variáveis de ambiente (produção)
```

---

## 📄 Páginas da Aplicação

### 🏠 Home (`/`) — Workspace Principal
- **Linhas:** 482 | **Arquivo:** [app/page.tsx](file:///c:/Users/Cliente/home-ai-web/app/page.tsx)
- Upload de foto do cômodo/fachada (câmera ou importação)
- Seleção de **tipo de ambiente**: Living room, Bedroom, Kitchen, Bathroom, Office, Dining room, Home theater, Store, House facade, Other
- Seleção de **estilo decorativo**: Modern, Minimalist, Scandinavian, Japanese, Rustic, Industrial, Boho, Super Luxury
- Botão "Generate" que envia à API `/api/generate`
- **Before/After Slider** comparativo em tempo real
- **Carrossel de exemplos** ([ExampleCarousel](file:///c:/Users/Cliente/home-ai-web/app/page.tsx#102-130)) quando não há foto carregada (7 imagens em loop com fade)
- **Download direto** via Blob (força download na pasta de Downloads)
- **Salvamento automático** na galeria do Supabase
- Badge de créditos restantes ([CreditsBadge](file:///c:/Users/Cliente/home-ai-web/app/components/CreditsBadge.tsx#19-59))
- Dock de navegação flutuante (desktop) estilo macOS
- Preparação de imagem: redimensionamento automático (max 1536px), conversão para JPEG com qualidade 0.92

### 🔐 Login (`/login`)
- **Linhas:** 274 | **Arquivo:** [app/login/page.tsx](file:///c:/Users/Cliente/home-ai-web/app/login/page.tsx)
- Login com **Google OAuth** (redirectTo: `/auth/callback`)
- Login com **Email + Senha** (sign in ou sign up automático)
- Detecção inteligente de link de indicação (`?ref=`) — muda título para "Start Creating"
- Mensagens de feedback visuais com glassmorphism (sucesso em verde, erro em vermelho)
- Input de e-mail com `inputMode="email"` e `fontSize: 16px` (previne zoom no iPhone)

### 🖼️ Gallery (`/gallery`)
- **Linhas:** 375 | **Arquivo:** [app/gallery/page.tsx](file:///c:/Users/Cliente/home-ai-web/app/gallery/page.tsx)
- Galeria de designs gerados pelo usuário (lidos do Supabase `gallery_items`)
- Layout **Masonry** responsivo (2 colunas mobile, 3 tablet, 4 desktop)
- **Modo Cinema:** Visualizador ampliado com carrossel (setas Prev/Next)
- Favoritos com toggle (★/☆)
- Download direto com Blob
- Exclusão de itens (remove do DB + Storage)
- Compartilhamento nativo via `navigator.share()` (mobile)

### 👤 Profile (`/profile`)
- **Linhas:** 509 | **Arquivo:** [app/profile/page.tsx](file:///c:/Users/Cliente/home-ai-web/app/profile/page.tsx)
- Foto de perfil com upload e remoção (avatar no Supabase Storage, cache-buster `?t=timestamp`)
- Estatísticas reais do usuário (Total Designs, Estilo Favorito) vindas do Supabase
- Informações pessoais (e-mail, plano atual, status da conta)
- **Link de indicação** dinâmico (`/login?ref=user_id`) com botão de copiar
- Toggle Light/Dark mode
- Botão de Logout
- Seção Help & Support com links para Privacy, Terms, Support
- Botão **Instalar App** (PWA)
- Dock de navegação flutuante (desktop)

### ⭐ Upgrade (`/upgrade`)
- **Linhas:** 324 | **Arquivo:** [app/upgrade/page.tsx](file:///c:/Users/Cliente/home-ai-web/app/upgrade/page.tsx)
- Cards de planos com hierarquia visual (badge "Best Value" no Pro+)
- Detecção do plano atual do usuário (bloqueia downgrades acidentais, marca "Current Plan" / "Included in your plan")
- Botão de checkout Stripe por plano
- Botão de acesso ao Billing Portal (gerenciamento de assinatura)
- Aviso legal: créditos não acumulativos, resetam na renovação

### 📋 Páginas Estáticas
- **Privacy Policy** (`/privacy`) — Política de privacidade
- **Terms of Service** (`/terms`) — Termos de uso
- **Support** (`/support`) — Contato de suporte por e-mail

---

## ⚙️ API Routes (Backend)

### `/api/generate` — Geração de Imagem com IA
- **Método:** POST (FormData: `image`, `style`, `roomType`)
- **Autenticação:** Requer usuário logado
- **Fluxo:**
  1. Verifica autenticação do usuário
  2. Verifica e consome crédito (paid → bonus → free, com refund em caso de erro)
  3. Constrói prompt inteligente baseado no estilo e tipo de ambiente
  4. Chama fal.ai FLUX Kontext Dev (image-to-image)
  5. Retorna imagem JPEG como binary response
- **Bypass de créditos:** Lista de IDs de usuário especiais (`PRO_BYPASS_USER_IDS`)

### `/api/credits` — Consulta de Créditos
- **Método:** GET
- Retorna plano atual, créditos restantes (total + breakdown: free/bonus/paid), período do plano

### `/api/referral` — Processamento de Indicações
- **Método:** POST (`{ referrerId }`)
- Registra indicação na tabela `referrals` (bloqueia duplicatas)
- Dá +1 crédito `free_base` ao indicador

### `/api/send-welcome` — E-mail de Boas-Vindas
- **Método:** POST (`{ email, firstName }`)
- Envia e-mail via Resend com template HTML premium (fundo dark, dourado, CTA)

### `/api/stripe/checkout` — Checkout Stripe
- **Método:** POST (`{ plan: "pro" | "pro_plus" }`)
- Cria ou recupera `stripe_customer_id`
- Cria Checkout Session com metadata de `user_id` e `plan`

### `/api/stripe/portal` — Billing Portal
- **Método:** POST
- Cria sessão do Billing Portal Stripe (gerenciamento de assinatura)

### `/api/stripe/webhook` — Webhook Stripe
- **Método:** POST
- Validação de assinatura (`stripe.webhooks.constructEvent`)
- Idempotência via tabela `stripe_events`
- Eventos processados:
  - `checkout.session.completed` — Ativa plano Pro/Pro+
  - `customer.subscription.created/updated` — Atualiza plano e créditos
  - `customer.subscription.deleted` — Downgrade para Free

---

## 🧩 Componentes Reutilizáveis

| Componente | Arquivo | Descrição |
|---|---|---|
| [ThemeProvider](file:///c:/Users/Cliente/home-ai-web/app/components/ThemeProvider.tsx#15-55) | [components/ThemeProvider.tsx](file:///c:/Users/Cliente/home-ai-web/app/components/ThemeProvider.tsx) | Contexto global de tema (light/dark), persiste em `localStorage` |
| [BottomTabs](file:///c:/Users/Cliente/home-ai-web/app/components/BottomTabs.tsx#47-127) | [components/BottomTabs.tsx](file:///c:/Users/Cliente/home-ai-web/app/components/BottomTabs.tsx) | Barra de navegação inferior mobile (Home, Gallery, Upgrade, Profile) |
| [ConditionalBottomBar](file:///c:/Users/Cliente/home-ai-web/app/components/ConditionalBottomBar.tsx#6-20) | [components/ConditionalBottomBar.tsx](file:///c:/Users/Cliente/home-ai-web/app/components/ConditionalBottomBar.tsx) | Esconde BottomTabs nas páginas de login/signup |
| [CreditsBadge](file:///c:/Users/Cliente/home-ai-web/app/components/CreditsBadge.tsx#19-59) | [components/CreditsBadge.tsx](file:///c:/Users/Cliente/home-ai-web/app/components/CreditsBadge.tsx) | Badge com créditos restantes + link para Upgrade |
| [InstallButton](file:///c:/Users/Cliente/home-ai-web/app/components/InstallButton.tsx#4-100) | [components/InstallButton.tsx](file:///c:/Users/Cliente/home-ai-web/app/components/InstallButton.tsx) | Botão PWA inteligente (detecta Android/iOS/instalado) |
| [ReferralTracker](file:///c:/Users/Cliente/home-ai-web/app/components/ReferralTracker.tsx#4-34) | [components/ReferralTracker.tsx](file:///c:/Users/Cliente/home-ai-web/app/components/ReferralTracker.tsx) | Motor invisível que captura `?ref=` e processa indicação |
| [WelcomeTrigger](file:///c:/Users/Cliente/home-ai-web/app/components/WelcomeTrigger.tsx#5-53) | [components/WelcomeTrigger.tsx](file:///c:/Users/Cliente/home-ai-web/app/components/WelcomeTrigger.tsx) | Dispara e-mail de boas-vindas no primeiro login |
| [GalleryGrid](file:///c:/Users/Cliente/home-ai-web/app/components/gallery/GalleryGrid.tsx#6-79) | [components/gallery/GalleryGrid.tsx](file:///c:/Users/Cliente/home-ai-web/app/components/gallery/GalleryGrid.tsx) | Grid masonry de imagens da galeria |
| `GalleryModal` | [components/gallery/GalleryModal.tsx](file:///c:/Users/Cliente/home-ai-web/app/components/gallery/GalleryModal.tsx) | Modal de visualização ampliada com carrossel |

---

## 🔐 Segurança & Autenticação

### Middleware ([proxy.ts](file:///c:/Users/Cliente/home-ai-web/proxy.ts))
- **Rotas Públicas:** `/_next`, `/api`, `/static`, `/login`, `/auth`, arquivos estáticos ([.svg](file:///c:/Users/Cliente/home-ai-web/public/file.svg), [.png](file:///c:/Users/Cliente/home-ai-web/public/icon-192x192.png), etc.)
- **Rotas Privadas Protegidas:** `/`, `/gallery`, `/profile`, `/upgrade`
- Se não autenticado → redireciona para `/login?next=<rota-original>`
- Refresh automático de sessão Supabase via cookies

### Callback OAuth (`/auth/callback`)
- Troca `code` do OAuth por sessão autenticada
- Redireciona para a página original (parâmetro `next`)

---

## 📱 PWA (Progressive Web App)

| Configuração | Valor |
|---|---|
| **Manifest** | [public/manifest.json](file:///c:/Users/Cliente/home-ai-web/public/manifest.json) |
| **Display** | `standalone` |
| **Background Color** | `#0A0A0A` |
| **Theme Color** | `#0A0A0A` |
| **Ícones** | 192x192 e 512x512 (brancos com detalhes dourados em 3D) |
| **Apple Touch Icon** | [apple-touch-icon.png](file:///c:/Users/Cliente/home-ai-web/public/apple-touch-icon.png) |
| **Captura de Install Prompt** | Via script global no [layout.tsx](file:///c:/Users/Cliente/home-ai-web/app/layout.tsx) (`window.__deferredInstallPrompt`) |
| **Detecção de instalação** | [(display-mode: standalone)](file:///c:/Users/Cliente/home-ai-web/app/api/generate/route.ts#73-77) + `navigator.standalone` (iOS) |

---

## 🗃️ Banco de Dados (Supabase PostgreSQL)

### Tabelas Identificadas

| Tabela | Descrição |
|---|---|
| `profiles` | Dados do usuário (id, full_name, avatar_url, is_pro, stripe_customer_id, stripe_subscription_id, welcome_sent) |
| `user_credits` | Créditos do usuário (user_id, plan, free_base, free_used, paid_monthly_allowance, paid_used, bonus_used, paid_period_start, paid_period_end) |
| `gallery_items` | Designs gerados (id, user_id, room_type, style, prompt, image_url, thumb_url, is_favorite) |
| `referrals` | Registro de indicações (referrer_id, referred_id) — unique constraint para prevenir duplicatas |
| `stripe_events` | Registro de eventos Stripe processados (id) — idempotência |

### Bucket de Storage
- **Nome:** `homeai`
- **Estrutura:** `{user_id}/{item_id}/final.jpg` + `{user_id}/{item_id}/thumb.jpg`

---

## 🔑 Variáveis de Ambiente Necessárias

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_ID_PRO=
STRIPE_PRICE_ID_PRO_PLUS=

# fal.ai (Motor de IA)
FAL_KEY=

# Resend (E-mails)
RESEND_API_KEY=

# App
APP_URL=https://homerenovai.com

# Bypass de créditos (opcional)
PRO_BYPASS_USER_IDS=
```

---

## 📜 Scripts Disponíveis

```bash
npm run dev      # Inicia servidor de desenvolvimento (webpack mode)
npm run build    # Build de produção
npm run start    # Inicia servidor de produção
npm run lint     # Executa ESLint
```

---

## 🎯 Funcionalidades Implementadas (Resumo)

- [x] Login com Google OAuth + Email/Senha
- [x] Geração de imagens com IA (fal.ai FLUX Kontext Dev)
- [x] 10 tipos de ambiente + 8 estilos decorativos
- [x] Prompt inteligente com detecção interior/fachada
- [x] Before/After Slider comparativo
- [x] Galeria pessoal com Masonry layout + Modo Cinema
- [x] Favoritos, Download direto e Compartilhamento
- [x] Sistema de créditos (Free 3 / Pro 100 / Pro+ 300)
- [x] Integração Stripe completa (Checkout, Portal, Webhooks)
- [x] Sistema de indicações (Referral) com +1 crédito
- [x] E-mail de boas-vindas (Resend)
- [x] PWA instalável (Android + iOS)
- [x] Tema Light/Dark persistente
- [x] Perfil com avatar, estatísticas reais e link de indicação
- [x] Proteção de rotas (middleware)
- [x] Layout híbrido responsivo (Desktop premium + Mobile nativo)
- [x] Refund automático de crédito em caso de erro na geração
- [x] Idempotência de webhooks Stripe
- [x] Páginas legais (Privacy, Terms, Support)

---

## 📏 Regra de Ouro do Desenvolvimento

> **Proteção do Desktop:** Sempre usar o prefixo `md:` do Tailwind ao ajustar espaçamentos e layouts para a versão Mobile. Isso garante que a versão Web continue blindada, luxuosa e com sua estrutura de painéis laterais intacta.

---

*Documento gerado em 10 de Março de 2026 — Análise completa do código-fonte sem nenhuma alteração no projeto.*
