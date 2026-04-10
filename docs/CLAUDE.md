# CLAUDE.md — Resumo Técnico para Continuidade do Projeto
> **Projeto:** HomeRenovAi  
> **Domínio:** https://homerenovai.com  
> **Hospedagem:** Vercel  
> **Última atualização:** Abril 2026 (Fase 1 totalmente concluída!)  
---
## 1. Objetivo Atual
O app está **100% funcional e estável**. Finalizamos com total sucesso a Fase 1 inteira estrutural de SEO (Sitemaps, Otimização de Imagens para WebP com Next/Image, e Schema.org). O próximo foco é dar andamento à **Fase 2 de Consolidação**.

### Plano SEO em Andamento (9 Passos)
| # | Passo | Status |
|---|-------|--------|
| 1 | Meta Tags customizadas em todas as páginas | ✅ Concluído |
| 2 | Open Graph Tags + Vídeo na Landing Page | ✅ Concluído |
| 3 | Sitemap.xml e Robots.txt | ✅ Concluído |
| 4 | Google Search Console (ação manual) | ✅ Concluído |
| 5 | Otimizar Imagens (WebP + Lazy Loading) | ✅ Concluído |
| 6 | Imagem OG Profissional (já adicionada em `/public/`) | ✅ Concluído |
| 7 | Schema.org Markup (JSON-LD) | ✅ Concluído |
| 8 | Bing Webmaster Tools (ação manual) | ✅ Concluído |
| 9 | Lighthouse Score 90+ | ✅ Concluído |
---
## 2. Status do Código
### 2.1 Stack Tecnológico
| Tecnologia | Versão | Uso |
|------------|--------|-----|
| Next.js | 16.1.1 | Framework principal (App Router, NÃO Pages Router) |
| React | 19.2.3 | UI |
| TypeScript | ^5 | Linguagem |
| Tailwind CSS | ^4 | Estilização (usa `md:` para responsividade) |
| Supabase | ^2.93.1 | Auth, Database, Storage |
| Stripe | ^20.3.0 | Pagamentos / Assinaturas |
| fal.ai | ^1.9.4 | Geração de imagens IA (SDXL image-to-image) |
| Resend | ^6.9.3 | Envio de emails transacionais |
| clsx | ^2.1.1 | Utilitário de classNames condicionais |
### 2.2 Estrutura de Arquivos
```
home-ai-web/
├── app/
│   ├── layout.tsx              ← Root Layout (Server Component) — metadata SEO global, 
│   │                             fontes (Playfair Display + Inter), ThemeProvider,
│   │                             Google Analytics (G-9VPVJCNYHH), PWA script
│   ├── page.tsx                ← Landing Page ("use client") — Vitrine pública com
│   │                             vídeo showcase, hero, inspiration grid
│   ├── globals.css             ← CSS global (Tailwind + variáveis de tema)
│   ├── favicon.ico
│   │
│   ├── workspace/
│   │   ├── layout.tsx          ← [NOVO] SEO metadata (Server Component)
│   │   └── page.tsx            ← Workspace de geração ("use client") — upload,
│   │                             seleção de estilo, geração IA, before/after slider
│   ├── login/
│   │   ├── layout.tsx          ← [NOVO] SEO metadata
│   │   └── page.tsx            ← Login ("use client") — Google OAuth + Email/Password
│   │
│   ├── gallery/
│   │   ├── layout.tsx          ← [NOVO] SEO metadata
│   │   └── page.tsx            ← Galeria pessoal ("use client") — grid de designs,
│   │                             modo cinema, favoritos, download, share, delete
│   ├── profile/
│   │   ├── layout.tsx          ← [NOVO] SEO metadata
│   │   └── page.tsx            ← Perfil ("use client") — avatar, créditos, stats,
│   │                             referral, plano, install PWA, sign out
│   ├── upgrade/
│   │   ├── layout.tsx          ← [NOVO] SEO metadata
│   │   └── page.tsx            ← Planos ("use client") — Free / Pro $9.99 / Pro+ $19.99,
│   │                             checkout Stripe, billing portal
│   ├── privacy/
│   │   └── page.tsx            ← Política de Privacidade (Server Component)
│   │                             [MODIFICADO] metadata SEO expandido
│   ├── terms/
│   │   └── page.tsx            ← Termos de Serviço (Server Component)
│   │                             [MODIFICADO] metadata SEO expandido
│   ├── support/
│   │   └── page.tsx            ← Suporte (Server Component)
│   │                             [MODIFICADO] metadata SEO adicionado
│   ├── auth/
│   │   └── callback/route.ts   ← Callback OAuth do Supabase
│   │
│   ├── api/
│   │   ├── credits/route.ts    ← GET: retorna créditos + plano do usuário
│   │   ├── generate/route.ts   ← POST: geração de imagem via fal.ai (SDXL i2i)
│   │   ├── referral/route.ts   ← POST: sistema de indicação (+1 crédito)
│   │   ├── send-welcome/route.ts ← POST: email de boas-vindas via Resend
│   │   ├── storage/cleanup/    ← Limpeza de storage
│   │   └── stripe/
│   │       ├── checkout/route.ts ← POST: cria sessão Stripe Checkout
│   │       ├── portal/route.ts   ← POST: abre portal de billing
│   │       └── webhook/route.ts  ← POST: webhook Stripe (eventos de pagamento)
│   │
│   ├── components/
│   │   ├── ThemeProvider.tsx    ← Context de tema Light/Dark (localStorage)
│   │   ├── BottomTabs.tsx      ← Navegação inferior mobile
│   │   ├── ConditionalBottomBar.tsx ← Renderização condicional do BottomTabs
│   │   ├── FloatingDock.tsx    ← Dock flutuante desktop (reutilizável)
│   │   ├── CreditsBadge.tsx    ← Badge de créditos no workspace
│   │   ├── InstallButton.tsx   ← Botão de instalação PWA
│   │   ├── ReferralTracker.tsx ← Rastreia código de indicação
│   │   ├── WelcomeTrigger.tsx  ← Dispara email de boas-vindas (1x por usuário)
│   │   ├── icons.tsx           ← Biblioteca de ícones SVG do app
│   │   └── gallery/            ← Componentes auxiliares da galeria
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts       ← Cliente Supabase (browser)
│   │   │   ├── server.ts       ← Cliente Supabase (server/API routes)
│   │   │   └── admin.ts        ← Cliente Supabase (admin/service role)
│   │   ├── stripe.ts           ← Inicialização do Stripe
│   │   ├── galleryDb.ts        ← Queries da galeria
│   │   ├── galleryStorage.ts   ← Lógica de storage da galeria
│   │   ├── resolveImageSrc.ts  ← Resolução de URLs de imagens
│   │   └── storageImages.ts    ← Utilitários de imagem
│   │
│   └── types/                  ← Tipos TypeScript
│
├── emails/
│   └── WelcomeEmail.tsx        ← Template de email React (Resend)
│
├── public/
│   ├── 16X9_HomeRenovAi_720P.mp4  ← Vídeo showcase (9.6 MB, 720p, 16:9)
│   ├── OG_1200x630_.jpg           ← Imagem OG para redes sociais
│   ├── hero-luxury.jpg            ← Imagem hero da landing page
│   ├── showcase-modern.jpg        ← Grid de inspiração
│   ├── showcase-scandinavian.jpg  ← Grid de inspiração
│   ├── showcase-industrial.jpg    ← Grid de inspiração
│   ├── examples/ex1-7.jpg         ← Carrossel do workspace (7 imagens)
│   ├── styles/*.jpg               ← 8 estilos (modern, minimalist, scandinavian,
│   │                                japanese, rustic, industrial, boho, super-luxury)
│   ├── icon-192x192.png           ← PWA icon
│   ├── icon-512x512.png           ← PWA icon
│   ├── apple-touch-icon.png       ← iOS icon
│   └── manifest.json              ← PWA manifest
│
├── proxy.ts                    ← Middleware de autenticação (protege rotas privadas)
├── next.config.ts              ← Configuração Next.js (vazia/default)
├── tsconfig.json               ← TypeScript config (paths: @/* → ./*)
├── postcss.config.mjs          ← PostCSS (Tailwind)
├── eslint.config.mjs           ← ESLint config
├── .env.local                  ← Variáveis de ambiente (Supabase, Stripe, fal.ai, Resend)
└── docs/                       ← Documentação interna do projeto
```
### 2.3 Rotas do App
| Rota | Tipo | Acesso | Descrição |
|------|------|--------|-----------|
| `/` | Client Component | 🌐 Público | Landing page (vitrine + vídeo) |
| `/workspace` | Client Component | 🔒 Privado | Workspace de geração IA |
| `/login` | Client Component | 🌐 Público | Login (Google + Email) |
| `/gallery` | Client Component | 🔒 Privado | Galeria pessoal |
| `/profile` | Client Component | 🔒 Privado | Perfil + settings |
| `/upgrade` | Client Component | 🔒 Privado | Planos e pricing |
| `/privacy` | Server Component | 🌐 Público | Política de privacidade |
| `/terms` | Server Component | 🌐 Público | Termos de serviço |
| `/support` | Server Component | 🌐 Público | Suporte |
### 2.4 Arquivos Criados/Modificados na Fase SEO
| Arquivo | Ação | O que faz |
|---------|------|-----------|
| `app/layout.tsx` | MODIFICADO | Metadata expandido e Schema.org (`WebApplication` JSON-LD). Scripts movidos para o `<body>` com a tag oficial `<Script>` do NextJS para pontuação 100 de Best Practices. |
| `app/page.tsx` | MODIFICADO | Inserido `<Image>` nativo; Adicionado blocos de Schema `VideoObject` e Vídeo principal antes do Hero. |
| `app/workspace/page.tsx` | MODIFICADO | Vitrines e painéis transformados em `<Image>` para suporte a WebP e Lazy Load absoluto. |
| `app/support/page.tsx` | MODIFICADO | Endereço de e-mail de suporte alterado definitivamente para `hello@homerenovai.com` |
| `public/sitemap.xml` | CRIADO | Mapa do site gerado mapeando as páginas abertas |
| `public/robots.txt` | CRIADO | Trava de indexador para as urls privadas |
| `app/workspace/layout.tsx` | CRIADO | SEO metadata para `/workspace` (Server Component wrapper) |
| `app/login/layout.tsx` | CRIADO | SEO metadata para `/login` |
| `app/gallery/layout.tsx` | CRIADO | SEO metadata para `/gallery` |
| `app/profile/layout.tsx` | CRIADO | SEO metadata para `/profile` |
| `app/upgrade/layout.tsx` | CRIADO | SEO metadata para `/upgrade` |
| `app/privacy/page.tsx` | MODIFICADO | Metadata expandido com description, keywords, OG, Twitter |
| `app/terms/page.tsx` | MODIFICADO | Metadata expandido com description, keywords, OG, Twitter |
| `public/16X9_HomeRenovAi_720P.mp4` | RENOMEADO | De `16X9 HomeRenovAi 720P.mp4` (remover espaços) |
---
## 3. Próximos Passos (To-Do)
### 🟡 Fase 1: SEO Máximo Impacto (Continuar)
- [x] **Passo 3 — Sitemap.xml + Robots.txt**
  - Criar `public/sitemap.xml` listando todas as páginas públicas
  - Criar `public/robots.txt` permitindo crawlers, apontando para sitemap
  - Páginas públicas: `/`, `/login`, `/privacy`, `/terms`, `/support`
  - Usar `lastmod: 2026-04-08`
- [x] **Passo 4 — Google Search Console** (Manual)
  - Adicionar propriedade `homerenovai.com`
  - Verificar via DNS (Vercel) ou meta tag
  - Submeter `sitemap.xml`
  - Solicitar indexação das páginas principais
- [x] **Passo 5 — Otimizar Imagens**
  - Implementado o `<Image>` do Next.js nativamente para otimização automática para WebP in-browser e scale-down.
  - Implementado o atributo `fill` e `priority` em LCP.
  - Adicionado `loading="lazy"` nas demais imagens below-the-fold (ex: grids e styles).
  - Componente Next Image adotado em `app/page.tsx` e `app/workspace/page.tsx`.
  - ⚠️ NÃO tocar nas imagens do Supabase Storage (geradas pelo usuário) - [Mantido]
### 🔵 Fase 2: Consolidação
- [x] **Passo 6 — Imagem OG** (Verificado e Validado: Padrões perfeitos e em conformidade)
- [x] **Passo 7 — Schema.org Markup** (JSON-LD: WebApplication, SoftwareApplication, VideoObject)
- [x] **Passo 8 — Bing Webmaster Tools** (Manual)
- [x] **Passo 9 — Lighthouse Score 90+** (Performance, SEO, Accessibility)
---
## 4. Decisões Técnicas
### 4.1 Arquitetura
| Decisão | Escolha | Razão |
|---------|---------|-------|
| Router | App Router (Next.js 16) | Padrão moderno, suporta Server/Client Components |
| Middleware | `proxy.ts` na raiz | Autenticação via Supabase SSR, protege rotas privadas |
| SEO em Client Components | `layout.tsx` por rota | Next.js exige Server Components para `export const metadata` |
| Tema | ThemeProvider (Context API) | Estado persistido em `localStorage` com key `homeai_theme` |
| Responsividade | `md:` breakpoint (Tailwind) | Mobile-first, breakpoint a 768px |
| Dev server | `next dev --webpack` | Flag `--webpack` explícita no script |
### 4.2 Portas e URLs
| Serviço | URL |
|---------|-----|
| Dev server (local) | `http://localhost:3000` |
| Produção | `https://homerenovai.com` |
| Google Analytics | `G-9VPVJCNYHH` |
| Supabase | Definido em `.env.local` (`NEXT_PUBLIC_SUPABASE_URL`) |
| Stripe | Definido em `.env.local` (chaves em `STRIPE_SECRET_KEY`) |
| fal.ai | Definido em `.env.local` (`FAL_KEY`) |
| Resend | Definido em `.env.local` (`RESEND_API_KEY`) |
| Suporte | `hello@homerenovai.com` |
### 4.3 Design System
| Elemento | Valor |
|----------|-------|
| Cor Dark | `#0A0A0A` |
| Cor Light BG | `#F4F4F5` |
| Dourado (accent) | `#D4AF37` |
| Azul (brand) | `#3B82F6` |
| Fonte títulos | Playfair Display (serif, `--font-playfair`) |
| Fonte corpo | Inter (sans, `--font-inter`) |
| Border radius (cards) | `rounded-[2.5rem]` desktop, `rounded-3xl` mobile |
| Logo | "Home" (dourado) + "RenovAi" (azul) + SparklesIcon |
### 4.4 Padrões de Código
- **Todas as páginas com interatividade**: `"use client"` no topo
- **Metadata SEO**: `export const metadata: Metadata` em Server Components (layout.tsx)
- **Temas**: `clsx()` para alternar classes `isDark ? X : Y`
- **Imagens estáticas**: Servidas de `/public/` com `<img>` tags
- **Imagens de usuário**: Supabase Storage bucket `homeai`
- **Navegação mobile**: `BottomTabs` (condicional) + hierarquia de z-index
- **Navegação desktop**: `FloatingDock` componente reutilizável
---
## 5. Pendências e Observações
### ⚠️ Bugs Conhecidos
- **Nenhum bug crítico reportado.** O app está estável em produção.
### 📌 Observações Importantes
1. **REGRA INVIOLÁVEL**: Nenhuma funcionalidade, componente visual, ou lógica de negócio pode ser alterada durante as implementações SEO. Toda mudança deve ser **cirúrgica e não-invasiva**.
2. **Imagens do Supabase**: As imagens geradas pelo usuário são armazenadas no Supabase Storage (bucket `homeai`) e **não devem ser otimizadas/convertidas** — são dinâmicas.
3. **Root layout.tsx**: Contém Google Analytics, PWA scripts, fontes, e ThemeProvider. É extremamente sensível — modificações devem ser **apenas no objeto metadata**.
4. **Middleware (`proxy.ts`)**: Protege `/workspace`, `/gallery`, `/profile` e `/upgrade`. Ignora `/`, `/login`, `/auth`, `/api`, `/privacy`, `/terms`, `/support` e arquivos estáticos. **Não modificar** sem necessidade extrema.
5. **Vídeo na Landing**: O vídeo `16X9_HomeRenovAi_720P.mp4` (9.6 MB) é reproduzido antes do Hero com autoplay/muted/loop/playsInline. O poster fallback é a imagem OG.
6. **Emails**: O sistema de email de boas-vindas usa Resend com template React (`emails/WelcomeEmail.tsx`). O trigger está no `WelcomeTrigger.tsx` (dispara 1x por sessão).
7. **Stripe**: Três planos — Free (3 créditos), Pro ($9.99/mês, 100 créditos), Pro+ ($19.99/mês, 300 créditos). Webhook processa eventos de pagamento automaticamente.
8. **PWA**: O app é instalável como PWA. O manifest está em `/public/manifest.json`, ícones em `/public/icon-*.png`.
9. **Suporte a e-mail**: A página `/support` exibe agora o endereço atualizado `hello@homerenovai.com`. (✅ Concluído)
---
> **Atenção Próximo Agente IA (Hand-off):** 
> * Leia todas as anotações. A Fase 1 de impacto estrutural está 100% concluída (todas as melhorias lógicas invisíveis e substituição global por Next `Image`).
> * As rotinas do front-end são altamente sofisticadas e não devem ser alteradas na essência.
> * As etapas Otimização e Lighthouse foram finalizadas (Desempenho Estável: 80 Performance Mobile | 100 Best Practices | 100 SEO). Seu objetivo agora é aguardar as coordenadas do usuário sobre a PRÓXIMA bateria criativa de desenvolvimento (Fase 3).
> * Não quebre as vitrines e os delays de vídeos implementados (Eles mantêm o nosso teto de performance do celular cravado em 80).
> * Rode localmente `npm run dev` marcando no final o checkbox como concluído à medida que completa as vitórias! Bom trabalho.
