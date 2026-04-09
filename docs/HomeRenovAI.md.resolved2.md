# 🏠 HomeRenovAI — Documentação Completa do Projeto (v2)

> **Aplicação de design de interiores e exteriores baseada em Inteligência Artificial.**
> Permite ao usuário transformar fotos de cômodos e fachadas em diferentes estilos decorativos usando IA generativa.

> [!NOTE]
> **Este documento é uma atualização do `HomeRenovAI.md.resolved`** (gerado em 10/03/2026). Reflete todas as mudanças feitas no projeto desde então. Análise realizada em 17 de Março de 2026.

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
| **Tipografia** | Google Fonts — **Playfair Display** (serifada, títulos) + **Inter** (sans-serif, corpo) |
| **Hospedagem** | Vercel |
| **Pasta do Projeto** | `home-ai-web` (mantida para preservar conexões de Deploy e Git) |

---

## 🆕 Principais Mudanças Desde o Documento Anterior

> Sumário executivo das evoluções identificadas entre 10/03/2026 e 17/03/2026.

| # | Mudança | Impacto |
|---|---|---|
| 1 | **Nova Landing Page (Vitrine)** em `/` | A rota raiz agora é uma página de vendas pública — não redireciona mais para `/login` |
| 2 | **Workspace movido para `/workspace`** | O workspace de geração de imagens foi relocado de `/` (482 linhas) para `/workspace` (482 linhas) |
| 3 | **Google Fonts integradas** | `Playfair Display` (serifada, variável `--font-playfair`) e `Inter` (sans-serif, variável `--font-inter`) adicionadas ao `layout.tsx` |
| 4 | **Proxy (Middleware) atualizado** | Rota `/workspace` agora é privada em vez de `/`. Landing Page (`/`) é pública |
| 5 | **Navegação atualizada** | Dock flutuante e BottomTabs agora apontam para `/workspace` (link "Home") |
| 6 | **ConditionalBottomBar esconde na Landing** | BottomTabs não aparece na rota `/` (Vitrine) nem em `/login` |
| 7 | **Gallery com grid refatorado** | Grid mudou para 3 colunas (`sm:2 / lg:3`) com cards arredondados `rounded-[2.5rem]` e efeito hover elevado |
| 8 | **Motor de IA com modifiers de interiores** | `generate/route.ts` agora tem dicionário detalhado de materiais para **interiores** (além das fachadas que já existiam) |
| 9 | **`guidance_scale` ajustada** | Interior: `12` (era 10) / Fachada: `13` (mantido) |
| 10 | **Preparação de imagem otimizada** | Redimensionamento máximo: `1024px` (era 1536px), JPEG quality: `0.85` (era 0.92) |
| 11 | **WelcomeTrigger corrigido** | Supabase client agora é criado **dentro** do `useEffect` (era fora — causava re-renders) |
| 12 | **Pacote `openai` removido** | O SDK da OpenAI foi removido do `package.json` (era peso morto de ~2MB) |
| 13 | **`PARECER_PROFISSIONAL.md` adicionado** | Documento de análise profissional na pasta `docs/` |
| 14 | **Imagens de showcase adicionadas** | `hero-luxury.jpg`, `showcase-modern.jpg`, `showcase-scandinavian.jpg`, `showcase-industrial.jpg` em `public/` |
| 15 | **Tipo de ambiente "Balcony" adicionado** | Substituiu "Dining room" na lista de `ROOM_TYPES` do Workspace |

---

## 🎨 Identidade Visual

| Elemento | Valor |
|---|---|
| **Cor Primária (Fundo Dark)** | `#0A0A0A` |
| **Cor de Destaque (Dourado Premium)** | `#D4AF37` |
| **Cor Secundária (Azul)** | `#3B82F6` (usado no "RenovAi" e ícone Sparkles) |
| **Modo de Tema** | Light / Dark (persistente via `localStorage`, chave `homeai_theme`) |
| **Fonte Título** | Playfair Display (serifada, variável CSS `--font-playfair`) |
| **Fonte Corpo** | Inter (sans-serif, variável CSS `--font-inter`) |
| **Layout Desktop** | "Big Screen Experience" — Painéis duplos, Dock flutuante estilo Mac |
| **Layout Mobile** | "App Nativo" — Elementos edge-to-edge, Bottom Tab Bar |
| **Logo** | "Home" (dourado no dark / preto no light) + "RenovAi" (azul `#3B82F6`) + ícone SVG Sparkles |

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
| `stripe` | ^20.3.0 | SDK Stripe (pagamentos, assinaturas, webhooks) |
| `resend` | ^6.9.3 | SDK Resend (envio de e-mails transacionais) |
| `clsx` | ^2.1.1 | Utilitário para classes CSS condicionais |

> [!TIP]
> **Pacote `openai` removido ✅** — O SDK da OpenAI foi removido do `package.json` desde a última análise. A migração para fal.ai está 100% completa.

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
- **Storage:** Bucket `homeai` para armazenamento de imagens geradas e avatares de perfil
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
  - **Pro** — 100 créditos/mês ($9.99)
  - **Pro+** — 300 créditos/mês ($19.99, marcado como "Best Value")
- **Regra de negócio:** Créditos **não são acumulativos** — resetam na renovação do ciclo

### 3. fal.ai (Motor de IA — Geração de Imagens)
- **Modelo:** `fal-ai/flux-kontext/dev` (Image-to-Image)
- **Parâmetros de qualidade:**
  - `num_inference_steps: 35`
  - `guidance_scale: 12` (interiores) / `13` (fachadas) — ⚠️ *mudança: interior era 10, agora é 12*
  - `output_format: "jpeg"`
- **Prompt inteligente:** Detecta automaticamente se o ambiente é interior ou fachada e ajusta os termos do prompt
- **Dicionário de estilos para fachadas:** Descrições detalhadas de materiais e arquitetura por estilo
- **🆕 Dicionário de estilos para interiores:** Descrições detalhadas de mobiliário, texturas, iluminação e materiais por estilo (Modern, Minimalist, Scandinavian, Japanese, Rustic, Industrial, Boho, Super Luxury)

### 4. Resend (E-mails Transacionais)
- **Domínio verificado:** `homerenovai.com` (autenticado via DNS na Vercel)
- **E-mail de boas-vindas:** Automatizado via [WelcomeTrigger](file:///c:/Users/Cliente/home-ai-web/app/components/WelcomeTrigger.tsx) component + API `/api/send-welcome`
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
│   │   ├── credits/route.ts          # GET — Consulta de créditos (85 linhas)
│   │   ├── generate/route.ts         # POST — Geração de imagem via fal.ai (296 linhas)
│   │   ├── referral/route.ts         # POST — Processamento de indicações
│   │   ├── send-welcome/route.ts     # POST — Envio de e-mail de boas-vindas (Resend)
│   │   ├── storage/cleanup/          # Limpeza de storage
│   │   └── stripe/
│   │       ├── checkout/route.ts     # POST — Criação de Checkout Session
│   │       ├── portal/route.ts       # POST — Criação de Billing Portal Session
│   │       └── webhook/route.ts      # POST — Receptor de webhooks Stripe
│   │
│   ├── auth/
│   │   └── callback/route.ts         # GET — Callback OAuth (troca code por session)
│   │
│   ├── components/                   # Componentes React reutilizáveis
│   │   ├── BottomTabs.tsx            # Barra de navegação inferior (mobile, 4 tabs - 128 linhas)
│   │   ├── ConditionalBottomBar.tsx  # Esconde BottomTabs na Landing (/) e Login
│   │   ├── CreditsBadge.tsx          # Badge de créditos restantes
│   │   ├── InstallButton.tsx         # Botão PWA "Instalar App" (Android/iOS)
│   │   ├── ReferralTracker.tsx       # Motor invisível de indicações
│   │   ├── ThemeProvider.tsx         # Contexto global Light/Dark mode (62 linhas)
│   │   ├── WelcomeTrigger.tsx        # Gatilho de e-mail de boas-vindas (71 linhas)
│   │   └── gallery/
│   │       ├── GalleryGrid.tsx       # Grid masonry de imagens (79 linhas - legado)
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
│   ├── page.tsx                      # 🆕 LANDING PAGE / VITRINE (153 linhas)
│   ├── workspace/page.tsx            # 🆕 WORKSPACE de geração (482 linhas - era page.tsx)
│   ├── login/page.tsx                # Página de Login (274 linhas)
│   ├── gallery/page.tsx              # Página da Galeria (376 linhas)
│   ├── profile/page.tsx              # Página de Perfil (509 linhas)
│   ├── upgrade/page.tsx              # Página de Upgrade/Planos (324 linhas)
│   ├── privacy/page.tsx              # Política de Privacidade
│   ├── terms/page.tsx                # Termos de Serviço
│   ├── support/page.tsx              # Página de Suporte
│   ├── layout.tsx                    # Layout raiz (Google Fonts, ThemeProvider, PWA, BottomTabs - 65 linhas)
│   ├── globals.css                   # CSS global (variáveis de tema)
│   └── favicon.ico                   # Ícone do site
│
├── emails/
│   └── WelcomeEmail.tsx              # Template HTML do e-mail de boas-vindas
│
├── public/
│   ├── manifest.json                 # Manifest PWA
│   ├── hero-luxury.jpg               # 🆕 Imagem hero da Landing Page
│   ├── showcase-modern.jpg           # 🆕 Showcase estilo Modern
│   ├── showcase-scandinavian.jpg     # 🆕 Showcase estilo Scandinavian
│   ├── showcase-industrial.jpg       # 🆕 Showcase estilo Industrial
│   ├── icon-192x192.png              # Ícone PWA 192x192
│   ├── icon-512x512.png              # Ícone PWA 512x512
│   ├── apple-touch-icon.png          # Ícone iOS
│   ├── examples/                     # 7 imagens de exemplo (carrossel do Workspace)
│   │   └── ex1.jpg ... ex7.jpg
│   └── styles/                       # 8 imagens de preview dos estilos
│       └── boho.jpg, industrial.jpg, japanese.jpg, minimalist.jpg,
│           modern.jpg, rustic.jpg, scandinavian.jpg, super-luxury.jpg
│
├── docs/
│   ├── HomeRenovAI.md.resolved       # Documentação v1 (10/03/2026)
│   ├── PARECER_PROFISSIONAL.md       # 🆕 Análise profissional do projeto
│   └── PROJECT_STATE.md              # Histórico completo do desenvolvimento
│
├── proxy.ts                          # Middleware de autenticação e proteção de rotas (85 linhas)
├── package.json                      # Dependências e scripts (sem openai ✅)
├── tsconfig.json                     # Configuração TypeScript
├── next.config.ts                    # Configuração Next.js
├── postcss.config.mjs                # Configuração PostCSS
├── eslint.config.mjs                 # Configuração ESLint
├── .env.local                        # Variáveis de ambiente (local)
└── .env.test.local                   # Variáveis de ambiente (teste)
```

---

## 📄 Páginas da Aplicação

### 🏪 Landing Page / Vitrine (`/`) — **NOVA**
- **Linhas:** 153 | **Arquivo:** [app/page.tsx](file:///c:/Users/Cliente/home-ai-web/app/page.tsx)
- **Página pública** (não requer autenticação)
- Header fixo com backdrop blur, logo "HomeRenovAi" e toggle de tema
- **Hero Section:**
  - Badge "The New Standard of Interior Design"
  - Título serif "Your Dream Home, *Reimagined* in Seconds."
  - CTA dinâmico: "Start Your Transformation — 3 Free Credits" (visitante) ou "Start Your Transformation" (logado)
  - Imagem hero luxuosa (`hero-luxury.jpg`) com hover zoom e badge de estilo "Super Luxury"
- **Inspiration Grid:** 3 cards de showcase com estilos (Scandinavian, Modern Designer, Luxury Industrial)
- **Footer:** "© 2026 HomeRenovAi. The pinnacle of AI design."
- **Detecção de login:** Verifica Supabase auth para adaptar o texto do CTA
- **Link principal:** Direciona para `/workspace`

### 🎨 Workspace (`/workspace`) — **RELOCADO**
- **Linhas:** 482 | **Arquivo:** [app/workspace/page.tsx](file:///c:/Users/Cliente/home-ai-web/app/workspace/page.tsx)
- **Rota protegida** (requer autenticação via middleware + verificação client-side)
- Upload de foto do cômodo/fachada (câmera ou importação)
- Seleção de **tipo de ambiente**: Living room, Bedroom, Kitchen, Bathroom, Office, **Balcony** (🆕, substituiu Dining room), Home theater, Store, House facade, Other
- Seleção de **estilo decorativo**: Modern, Minimalist, Scandinavian, Japanese, Rustic, Industrial, Boho, Super Luxury
- Botão "Generate Design" que envia à API `/api/generate`
- **Before/After Slider** comparativo com selos "Before"/"After" e cursor arrastável
- **Carrossel de exemplos** quando não há foto carregada (7 imagens em loop com fade a cada 4s)
- **Photo Tips Modal** com dicas (Lighting, Perspective, Clutter, Focus)
- **Download direto** via Blob (força download na pasta de Downloads)
- **Salvamento automático** na galeria do Supabase (upload direto no client-side)
- Badge de créditos restantes ([CreditsBadge](file:///c:/Users/Cliente/home-ai-web/app/components/CreditsBadge.tsx))
- Dock de navegação flutuante (desktop) estilo macOS — **link "Home" aponta para `/workspace`**
- Preparação de imagem: redimensionamento automático (max **1024px** ⬇️ era 1536px), conversão para JPEG com qualidade **0.85** ⬇️ (era 0.92)
- **Trava de segurança:** Se não logado, redireciona para `/login` via `router.push`
- Persistência de resultado via `sessionStorage` (`homeai_last_result`)

### 🔐 Login (`/login`)
- **Linhas:** 274 | **Arquivo:** [app/login/page.tsx](file:///c:/Users/Cliente/home-ai-web/app/login/page.tsx)
- Login com **Google OAuth** (redirectTo: `/auth/callback`)
- Login com **Email + Senha** (sign in ou sign up automático)
- Detecção inteligente de link de indicação (`?ref=`) — muda título para "Start Creating"
- Mensagens de feedback visuais com glassmorphism (sucesso em verde, erro em vermelho)
- Input de e-mail com `inputMode="email"` e `fontSize: 16px` (previne zoom no iPhone)
- Glow dourado decorativo no modo Dark

### 🖼️ Gallery (`/gallery`)
- **Linhas:** 376 | **Arquivo:** [app/gallery/page.tsx](file:///c:/Users/Cliente/home-ai-web/app/gallery/page.tsx)
- Galeria de designs gerados pelo usuário (lidos do Supabase `gallery_items`)
- Layout **responsivo**: 1 coluna (mobile), 2 colunas (sm), **3 colunas** (lg) — ⚠️ *mudança: era 2/3/4*
- Cards com `rounded-[2.5rem]`, gradiente de sobreposição, badge do estilo, e citação do prompt em itálico
- **Modo Cinema:** Visualizador ampliado com carrossel (setas Prev/Next)
- Favoritos com toggle (★/☆)
- Download direto com Blob (fallback: nova aba)
- Exclusão de itens (remove do DB, confirmação via `confirm()`)
- Compartilhamento nativo via `navigator.share()` (mobile)
- Dock flutuante (desktop) com link "Home" apontando para `/workspace`
- Badge "Premium Collection" no header

### 👤 Profile (`/profile`)
- **Linhas:** 509 | **Arquivo:** [app/profile/page.tsx](file:///c:/Users/Cliente/home-ai-web/app/profile/page.tsx)
- Foto de perfil com upload e remoção (avatar no Supabase Storage, cache-buster `?t=timestamp`)
- Estatísticas reais do usuário (Total Designs, Estilo Favorito) vindas do Supabase
- **Card de Créditos** com botão "Invite Friend • Earn +1 Credit" e modal "How It Works"
- **Card Best Plan** — Promo Pro+ Elite com botão "Upgrade"
- **Accordion: Personal Information** (expandível) com e-mail e status da conta
- Links para Privacy Policy e Terms of Service
- **Quick Stats** grid (Total Designs + Favorite Style)
- **Help & Support** com link de e-mail `suporte@homerenovai.com`
- Botão **Instalar App** (PWA)
- Botão de Logout (estilizado em vermelho)
- Footer: "HomeRenovAi v2.1.0 • Built for Excellence"
- Dock flutuante (desktop) com link "Home" apontando para `/workspace`

### ⭐ Upgrade (`/upgrade`)
- **Linhas:** 324 | **Arquivo:** [app/upgrade/page.tsx](file:///c:/Users/Cliente/home-ai-web/app/upgrade/page.tsx)
- Cards de planos com hierarquia visual (badge "Best Value" no Pro+)
- Detecção do plano atual do usuário via API `/api/credits` (bloqueia downgrades acidentais, marca "Current Plan" / "Included in your plan")
- Botão de checkout Stripe por plano
- Botão de acesso ao Billing Portal (gerenciamento de assinatura)
- Aviso legal: créditos não acumulativos, resetam na renovação
- Dock flutuante (desktop) com link "Home" apontando para `/workspace`

### 📋 Páginas Estáticas
- **Privacy Policy** (`/privacy`) — Política de privacidade
- **Terms of Service** (`/terms`) — Termos de uso
- **Support** (`/support`) — Contato de suporte por e-mail

---

## ⚙️ API Routes (Backend)

### `/api/generate` — Geração de Imagem com IA
- **Método:** POST (FormData: `image`, `style`, `roomType`)
- **Linhas:** 296 (⬇️ era 341)
- **Autenticação:** Requer usuário logado
- **Fluxo:**
  1. Verifica autenticação do usuário
  2. Verifica e consome crédito (paid → bonus → free, com refund em caso de erro)
  3. Constrói prompt inteligente baseado no estilo e tipo de ambiente
  4. Usa dicionário detalhado de estilos para **interiores e fachadas** (🆕)
  5. Chama fal.ai FLUX Kontext Dev (image-to-image) — `guidance_scale`: 12 (interior) / 13 (fachada)
  6. Retorna imagem JPEG como binary response
- **Bypass de créditos:** Lista de IDs de usuário especiais (`PRO_BYPASS_USER_IDS`)

### `/api/credits` — Consulta de Créditos
- **Método:** GET | **Linhas:** 85
- Retorna plano atual, créditos restantes (total + breakdown: free/bonus/paid), período do plano
- Detecção automática de plano caso campo `plan` não exista na tabela

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

| Componente | Arquivo | Linhas | Descrição |
|---|---|---|---|
| [ThemeProvider](file:///c:/Users/Cliente/home-ai-web/app/components/ThemeProvider.tsx) | ThemeProvider.tsx | 62 | Contexto global de tema (light/dark), persiste em `localStorage`, expõe `isDark`, `toggleTheme`, `setTheme` |
| [BottomTabs](file:///c:/Users/Cliente/home-ai-web/app/components/BottomTabs.tsx) | BottomTabs.tsx | 128 | Barra de navegação inferior mobile (Home → `/workspace`, Gallery, Upgrade, Profile) |
| [ConditionalBottomBar](file:///c:/Users/Cliente/home-ai-web/app/components/ConditionalBottomBar.tsx) | ConditionalBottomBar.tsx | 20 | Esconde BottomTabs em `/` (Landing), `/login`, `/signup`, `/forgot-password` |
| [CreditsBadge](file:///c:/Users/Cliente/home-ai-web/app/components/CreditsBadge.tsx) | CreditsBadge.tsx | — | Badge com créditos restantes + link para Upgrade |
| [InstallButton](file:///c:/Users/Cliente/home-ai-web/app/components/InstallButton.tsx) | InstallButton.tsx | — | Botão PWA inteligente (detecta Android/iOS/instalado) |
| [ReferralTracker](file:///c:/Users/Cliente/home-ai-web/app/components/ReferralTracker.tsx) | ReferralTracker.tsx | — | Motor invisível que captura `?ref=` e processa indicação |
| [WelcomeTrigger](file:///c:/Users/Cliente/home-ai-web/app/components/WelcomeTrigger.tsx) | WelcomeTrigger.tsx | 71 | Dispara e-mail de boas-vindas no primeiro login (✅ bug corrigido) |
| [GalleryGrid](file:///c:/Users/Cliente/home-ai-web/app/components/gallery/GalleryGrid.tsx) | GalleryGrid.tsx | 79 | Grid masonry de imagens da galeria (componente legado, galeria principal reimplementada em `gallery/page.tsx`) |
| GalleryModal | GalleryModal.tsx | — | Modal de visualização ampliada com carrossel |

---

## 🔐 Segurança & Autenticação

### Middleware ([proxy.ts](file:///c:/Users/Cliente/home-ai-web/proxy.ts))
- **Rotas Públicas:** `/_next`, `/api`, `/static`, `/login`, `/auth`, arquivos estáticos (`.svg`, `.png`, `.jpg`, etc.), **e a Landing Page `/`** (🆕)
- **Rotas Privadas Protegidas:** `/workspace` (🆕, era `/`), `/gallery`, `/profile`, `/upgrade`
- Se não autenticado → redireciona para `/login?next=<rota-original>`
- Refresh automático de sessão Supabase via cookies
- **Matcher regex:** Exclui `_next/static`, `_next/image`, `favicon.ico`, `manifest.json`, `login`, `auth`, `api`, e extensões de imagem

### Callback OAuth (`/auth/callback`)
- Troca `code` do OAuth por sessão autenticada
- Redireciona para a página original (parâmetro `next`)

---

## 📱 PWA (Progressive Web App)

| Configuração | Valor |
|---|---|
| **Manifest** | [public/manifest.json](file:///c:/Users/Cliente/home-ai-web/public/manifest.json) |
| **Display** | `standalone` |
| **Start URL** | `/` (Landing Page) |
| **Background Color** | `#0A0A0A` |
| **Theme Color** | `#0A0A0A` |
| **Ícones** | 192x192 e 512x512 (com cache-buster `?v=2`) |
| **Apple Touch Icon** | [apple-touch-icon.png](file:///c:/Users/Cliente/home-ai-web/public/apple-touch-icon.png) |
| **Captura de Install Prompt** | Via script global no [layout.tsx](file:///c:/Users/Cliente/home-ai-web/app/layout.tsx) (`window.__deferredInstallPrompt`) |
| **Detecção de instalação** | `(display-mode: standalone)` + `navigator.standalone` (iOS) |

---

## 🗃️ Banco de Dados (Supabase PostgreSQL)

### Tabelas Identificadas

| Tabela | Descrição |
|---|---|
| `profiles` | Dados do usuário (id, full_name, avatar_url, is_pro, stripe_customer_id, stripe_subscription_id, welcome_sent) |
| `user_credits` | Créditos do usuário (user_id, plan, free_base, free_used, paid_monthly_allowance, paid_used, bonus_used, paid_period_start, paid_period_end) |
| `gallery_items` | Designs gerados (id, user_id, room_type, style, prompt, image_url, thumb_url, is_favorite, created_at) |
| `referrals` | Registro de indicações (referrer_id, referred_id) — unique constraint para prevenir duplicatas |
| `stripe_events` | Registro de eventos Stripe processados (id) — idempotência |

### Bucket de Storage
- **Nome:** `homeai`
- **Estrutura de imagens geradas:** `{user_id}/{uuid}.jpg` (upload direto no client-side do Workspace)
- **Estrutura de avatares:** `{user_id}/avatar.{ext}` (com cache-buster `?t=timestamp`)

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

- [x] **🆕 Landing Page pública** com Hero, Showcase Grid e CTA
- [x] Login com Google OAuth + Email/Senha
- [x] Geração de imagens com IA (fal.ai FLUX Kontext Dev)
- [x] 10 tipos de ambiente + 8 estilos decorativos
- [x] **🆕 Dicionário de materiais para interiores** (além de fachadas)
- [x] Prompt inteligente com detecção interior/fachada
- [x] Before/After Slider comparativo
- [x] Photo Tips Modal (Lighting, Perspective, Clutter, Focus)
- [x] Galeria pessoal com layout responsivo + Modo Cinema
- [x] Favoritos, Download direto e Compartilhamento
- [x] Sistema de créditos (Free 3 / Pro 100 / Pro+ 300)
- [x] Integração Stripe completa (Checkout, Portal, Webhooks)
- [x] Sistema de indicações (Referral) com +1 crédito e modal "How It Works"
- [x] E-mail de boas-vindas (Resend) — ✅ bug do WelcomeTrigger corrigido
- [x] PWA instalável (Android + iOS)
- [x] Tema Light/Dark persistente (contexto global via ThemeProvider)
- [x] Perfil com avatar, estatísticas reais, Quick Stats e link de indicação
- [x] Proteção de rotas (middleware) com Landing Page pública
- [x] Layout híbrido responsivo (Desktop premium + Mobile nativo)
- [x] Refund automático de crédito em caso de erro na geração
- [x] Idempotência de webhooks Stripe
- [x] Páginas legais (Privacy, Terms, Support)
- [x] **🆕 Tipografia premium** com Google Fonts (Playfair Display + Inter)
- [x] ~~Pacote openai removido~~ — migração completa para fal.ai

---

## 📊 Progresso do PARECER_PROFISSIONAL.md

> Verificação dos itens levantados na análise profissional de 10/03/2026:

| # | Item | Status | Notas |
|---|---|---|---|
| 🔴 1 | Stripe em modo LIVE | ⏳ Pendente | Verificar se chaves foram trocadas na Vercel |
| 🔴 2 | Validar WelcomeTrigger | ✅ **Corrigido** | Supabase client movido para dentro do `useEffect` |
| 🔴 3 | Remover pacote `openai` | ✅ **Feito** | Removido do `package.json` |
| 🟡 4 | Tratamento de erros na UI | ⏳ Pendente | Workspace exibe "Error generating image." genérico |
| 🟡 5 | Rate Limiting nas API Routes | ⏳ Pendente | Sem proteção contra abuso |
| 🟡 6 | Testes automatizados | ⏳ Pendente | Zero testes |
| 🟡 7 | SEO básico | ⚠️ Parcial | `<title>` e `<meta description>` existem via `layout.tsx`, mas faltam meta tags por página |
| 🟡 8 | Landing page pública | ✅ **Feito** | Landing Page completa com Hero, Showcase e CTA em `/` |
| 🟢 9 | Centralizar componentes duplicados | ⏳ Pendente | Ícones SVG e Dock flutuante continuam duplicados entre páginas |
| 🟢 10 | Analytics | ⏳ Pendente | |
| 🟢 11 | Push Notifications | ⏳ Pendente | |
| 🟢 12 | Compartilhamento social / OG Image | ⏳ Pendente | |

---

## 🔍 Observações Técnicas da Análise Atual

### Pontos de Atenção

1. **Ícones SVG duplicados** — Os mesmos ícones (`HomeIcon`, `GalleryIcon`, `StarIcon`, `UserIcon`, `SparklesIcon`) estão declarados localmente em `workspace/page.tsx`, `gallery/page.tsx`, `profile/page.tsx`, `upgrade/page.tsx` e `BottomTabs.tsx`. **Recomendação:** Extrair para `components/icons/` em um próximo refactor.

2. **Dock flutuante duplicado** — O menu dock de desktop está copiado em cada página (Workspace, Gallery, Profile, Upgrade). **Recomendação:** Criar componente `<FloatingDock />` reutilizável (sugestão do Parecer Profissional, item 9).

3. **`GalleryGrid.tsx` e `GalleryModal.tsx` podem ser legado** — A página `gallery/page.tsx` reimplementou o grid e o modal direto na própria página com design premium. Os componentes em `components/gallery/` parecem não estar sendo usados pela galeria principal.

4. **Salvamento de imagem direto no client** — No Workspace, a imagem gerada é salva no Supabase Storage e inserida na tabela `gallery_items` diretamente pelo client-side. Isso funciona com RLS configurado, mas seria mais seguro mover para uma API Route dedicada.

5. **`openai` desinstalado mas `node_modules` pode reter** — Confirmar com `npm ls openai` se o pacote realmente foi removido do lockfile.

---

## 📏 Regra de Ouro do Desenvolvimento

> **Proteção do Desktop:** Sempre usar o prefixo `md:` do Tailwind ao ajustar espaçamentos e layouts para a versão Mobile. Isso garante que a versão Web continue blindada, luxuosa e com sua estrutura de painéis laterais intacta.

---

*Documento gerado em 17 de Março de 2026 — Análise completa do código-fonte atualizado, sem nenhuma alteração no projeto.*
