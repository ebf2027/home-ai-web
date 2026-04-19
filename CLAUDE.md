# CLAUDE.md — Resumo Técnico para Continuidade do Projeto

> **Projeto:** HomeRenovAi  
> **Domínio:** https://homerenovai.com  
> **Hospedagem:** Vercel  
> **Última atualização:** 19 de Abril de 2026  
> **Status Geral:** ✅ App 100% funcional, em produção, pronto para monetização ativa  

---

## 1. O que é o HomeRenovAi

HomeRenovAi é um **SaaS de design de interiores e exteriores com inteligência artificial** voltado para o mercado americano. O usuário faz upload de uma foto de seu cômodo ou fachada, escolhe um dos 8 estilos disponíveis, e a IA transforma a imagem em um design profissional fotorrealista em segundos.

### Modelo de Negócio
- **Freemium**: 3 créditos gratuitos para novos usuários experimentarem
- **Pro**: $9.99/mês — 100 créditos mensais
- **Pro+**: $19.99/mês — 300 créditos mensais + licença comercial
- **Stripe em Modo LIVE**: Pagamentos reais já habilitados (USD)
- **Sistema de indicação**: +1 crédito para quem indica um amigo

---

## 2. Status Completo — O que já foi feito

### ✅ Infraestrutura & Backend
- [x] Motor de IA (fal.ai Flux Kontext) com prompts inteligentes por estilo/tipo
- [x] Sistema de créditos com consumo em cascata (paid → bonus → free)
- [x] Refund automático de créditos em caso de erro na geração
- [x] Stripe em modo LIVE com webhooks idempotentes (tabela `stripe_events`)
- [x] Autenticação via Supabase (Google OAuth + Email/Password)
- [x] Middleware de proteção de rotas privadas (`proxy.ts`)
- [x] Email de boas-vindas via Resend com template React premium
- [x] PWA configurada e instalável (iOS/Android/Desktop)
- [x] Google Analytics configurado (G-9VPVJCNYHH)

### ✅ SEO & Performance (9/9 passos concluídos)
- [x] Meta Tags customizadas em todas as páginas
- [x] Open Graph Tags + Vídeo na Landing Page
- [x] Sitemap.xml e Robots.txt
- [x] Google Search Console verificado e indexação submetida
- [x] Imagens otimizadas (WebP + Next/Image + Lazy Loading)
- [x] Imagem OG Profissional (1200x630)
- [x] Schema.org Markup (JSON-LD: WebApplication + VideoObject)
- [x] Bing Webmaster Tools configurado
- [x] Lighthouse Score: **88 Performance | 100 Best Practices | 100 SEO | 95 Accessibility**

### ✅ UX/UI Premium
- [x] Landing Page de conversão com vídeo showcase (WebM + MP4 progressivo)
- [x] Landing Page com vídeos responsivos (desktop 16:9 / mobile 4:5)
- [x] Hero section com CTA dinâmico (logged in vs. visitante)
- [x] Workspace com Before/After slider interativo
- [x] Galeria pessoal com modo cinema, favoritos, download, share
- [x] Perfil com stats reais do Supabase (Total Designs / Estilo Favorito)
- [x] Página de Upgrade inteligente (detecta plano atual)
- [x] Páginas legais (Privacy/Terms) com design premium
- [x] Suporte com email correto: hello@homerenovai.com
- [x] Tema Light/Dark persistente

### ✅ Otimizações Cirúrgicas de Performance
- [x] Vídeo com Progressive Enhancement (.webm primário + .mp4 fallback)
- [x] Preload nativo react-dom para poster LCP
- [x] Google Analytics com strategy="lazyOnload" (TBT zero)
- [x] setTimeout de 400ms no vídeo para liberação de thread

---

## 3. Stack Tecnológico

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| Next.js | 16.1.1 | Framework (App Router) |
| React | 19.2.3 | UI |
| TypeScript | ^5 | Linguagem |
| Tailwind CSS | ^4 | Estilização (mobile-first, `md:`) |
| Supabase | ^2.93.1 | Auth, Database, Storage |
| Stripe | ^20.3.0 | Pagamentos (Modo LIVE) |
| fal.ai | ^1.9.4 | Motor de IA (Flux Kontext image-to-image) |
| Resend | ^6.9.3 | Emails transacionais |
| clsx | ^2.1.1 | ClassNames condicionais |

---

## 4. Estrutura de Arquivos

```
home-ai-web/
├── app/
│   ├── layout.tsx              ← Root Layout + SEO global + Schema.org + GA + PWA
│   ├── page.tsx                ← Landing Page (vídeo showcase + hero + grid)
│   ├── globals.css
│   │
│   ├── workspace/              ← Workspace de geração IA
│   │   ├── layout.tsx          ← SEO metadata
│   │   └── page.tsx            ← Upload + estilo + geração + before/after
│   ├── login/
│   │   ├── layout.tsx          ← SEO metadata
│   │   └── page.tsx            ← Google OAuth + Email/Password
│   ├── gallery/
│   │   ├── layout.tsx          ← SEO metadata
│   │   └── page.tsx            ← Grid, cinema, favoritos, download
│   ├── profile/
│   │   ├── layout.tsx          ← SEO metadata
│   │   └── page.tsx            ← Avatar, créditos, stats, referral
│   ├── upgrade/
│   │   ├── layout.tsx          ← SEO metadata
│   │   └── page.tsx            ← Free / Pro $9.99 / Pro+ $19.99
│   ├── privacy/page.tsx        ← Política de Privacidade
│   ├── terms/page.tsx          ← Termos de Serviço
│   ├── support/page.tsx        ← Suporte (hello@homerenovai.com)
│   ├── auth/callback/route.ts  ← OAuth callback
│   │
│   ├── api/
│   │   ├── credits/route.ts    ← GET: créditos + plano
│   │   ├── generate/route.ts   ← POST: geração IA (fal.ai)
│   │   ├── referral/route.ts   ← POST: sistema de indicação
│   │   ├── send-welcome/route.ts ← POST: email boas-vindas
│   │   ├── storage/cleanup/    ← Limpeza storage
│   │   └── stripe/
│   │       ├── checkout/route.ts
│   │       ├── portal/route.ts
│   │       └── webhook/route.ts
│   │
│   ├── components/             ← ThemeProvider, BottomTabs, FloatingDock, etc.
│   ├── lib/                    ← Supabase (client/server/admin), Stripe, Gallery
│   └── types/                  ← TypeScript types
│
├── emails/WelcomeEmail.tsx     ← Template email React
├── public/                     ← Vídeos, imagens, PWA assets, sitemap, robots
├── proxy.ts                    ← Middleware de autenticação
└── docs/                       ← Documentação interna
```

---

## 5. Rotas do App

| Rota | Acesso | Descrição |
|------|--------|-----------|
| `/` | 🌐 Público | Landing page + vitrine |
| `/workspace` | 🔒 Privado | Workspace de geração IA |
| `/login` | 🌐 Público | Login (Google + Email) |
| `/gallery` | 🔒 Privado | Galeria pessoal |
| `/profile` | 🔒 Privado | Perfil + settings |
| `/upgrade` | 🔒 Privado | Planos e pricing |
| `/privacy` | 🌐 Público | Política de privacidade |
| `/terms` | 🌐 Público | Termos de serviço |
| `/support` | 🌐 Público | Suporte |

---

## 6. Design System

| Elemento | Valor |
|----------|-------|
| Dark BG | `#0A0A0A` |
| Light BG | `#F4F4F5` |
| Dourado (accent) | `#D4AF37` |
| Azul (brand) | `#3B82F6` |
| Fonte títulos | Playfair Display (serif) |
| Fonte corpo | Inter (sans) |
| Cards desktop | `rounded-[2.5rem]` |
| Cards mobile | `rounded-3xl` |
| Logo | "Home" (dourado) + "RenovAi" (azul) + SparklesIcon |

---

## 7. Regras Invioláveis

1. **Nenhuma funcionalidade pode ser alterada** durante implementações de marketing/SEO
2. **Imagens do Supabase Storage** (geradas pelo usuário) NÃO devem ser otimizadas
3. **Root layout.tsx** é extremamente sensível — alterações apenas no metadata
4. **proxy.ts** protege rotas privadas — não modificar sem necessidade
5. **NÃO desfazer**: vídeo `.webm`, `preload()` na home, GA com `lazyOnload`
6. **Responsividade**: sempre usar prefixo `md:` para proteger desktop

---

## 8. URLs e Serviços

| Serviço | URL/ID |
|---------|--------|
| Produção | https://homerenovai.com |
| Dev local | http://localhost:3000 |
| Google Analytics | G-9VPVJCNYHH |
| Suporte | hello@homerenovai.com |
| Supabase / Stripe / fal.ai / Resend | `.env.local` |

---

## 9. Próxima Fase: Monetização & Aquisição de Usuários

O app está **100% pronto para monetização**. A fase atual é de **divulgação e aquisição de usuários** focando no mercado americano. O plano detalhado está documentado em `docs/PLANO_MONETIZACAO.md`.

### Canais Prioritários:
1. **Pinterest** (Orgânico) — Canal #1 para o nicho de decoração
2. **TikTok** (Orgânico + Ads mínimo) — Before/after viral
3. **Product Hunt** — Lançamento de impacto
4. **Reddit** — Comunidades de design
5. **SEO Orgânico** — Já configurado, em maturação

---

> **Para continuar o projeto:** Leia este arquivo, rode `npm run dev` para iniciar na porta 3000. O app está estável, otimizado e pronto para receber usuários pagantes. Foque na estratégia de marketing documentada em `docs/PLANO_MONETIZACAO.md`.
