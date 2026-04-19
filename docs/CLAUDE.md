# CLAUDE.md — Resumo Técnico Detalhado (Documentação Interna)

> **Projeto:** HomeRenovAi  
> **Domínio:** https://homerenovai.com  
> **Hospedagem:** Vercel  
> **Última atualização:** 19 de Abril de 2026  
> **Status:** ✅ App 100% funcional. Todas as fases SEO concluídas. Monetização ativa.

---

## 1. Resumo do Estado Atual

O HomeRenovAi é um **SaaS de design de interiores/exteriores com IA** totalmente funcional e em produção. O app permite que usuários façam upload de fotos de cômodos ou fachadas e recebam redesigns fotorrealistas em 8 estilos diferentes.

### Marcos Concluídos
- ✅ Todas as features core (upload, geração IA, galeria, créditos, pagamentos)
- ✅ Stripe em Modo LIVE (pagamentos reais em USD)
- ✅ 9/9 passos de SEO concluídos
- ✅ Lighthouse: 88 Performance | 100 Best Practices | 100 SEO | 95 Accessibility
- ✅ Landing Page de alta conversão com vídeo showcase
- ✅ PWA instalável
- ✅ Emails transacionais (Resend)

### Fase Atual: Aquisição de Usuários & Monetização
O plano detalhado está documentado em `docs/PLANO_MONETIZACAO.md`.

---

## 2. Stack Tecnológico

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| Next.js | 16.1.1 | Framework principal (App Router) |
| React | 19.2.3 | UI |
| TypeScript | ^5 | Linguagem |
| Tailwind CSS | ^4 | Estilização (mobile-first, `md:` breakpoint) |
| Supabase | ^2.93.1 | Auth, Database (PostgreSQL), Storage |
| Stripe | ^20.3.0 | Pagamentos/Assinaturas (Modo LIVE) |
| fal.ai | ^1.9.4 | Motor de IA (Flux Kontext image-to-image) |
| Resend | ^6.9.3 | Emails transacionais |
| clsx | ^2.1.1 | ClassNames condicionais |

---

## 3. Arquitetura & Rotas

### Rotas do App

| Rota | Tipo | Acesso | Descrição |
|------|------|--------|-----------|
| `/` | Client Component | 🌐 Público | Landing page (vídeo + hero + grid + CTAs) |
| `/workspace` | Client Component | 🔒 Privado | Workspace de geração IA |
| `/login` | Client Component | 🌐 Público | Login (Google OAuth + Email/Password) |
| `/gallery` | Client Component | 🔒 Privado | Galeria pessoal (cinema, favoritos, share) |
| `/profile` | Client Component | 🔒 Privado | Perfil + stats + referral |
| `/upgrade` | Client Component | 🔒 Privado | Planos (Free / Pro $9.99 / Pro+ $19.99) |
| `/privacy` | Server Component | 🌐 Público | Política de privacidade |
| `/terms` | Server Component | 🌐 Público | Termos de serviço |
| `/support` | Server Component | 🌐 Público | Suporte (hello@homerenovai.com) |

### API Routes

| Rota | Método | Função |
|------|--------|--------|
| `/api/credits` | GET | Retorna créditos + plano do usuário |
| `/api/generate` | POST | Geração de imagem via fal.ai (Flux Kontext) |
| `/api/referral` | POST | Sistema de indicação (+1 crédito) |
| `/api/send-welcome` | POST | Email de boas-vindas via Resend |
| `/api/stripe/checkout` | POST | Cria sessão Stripe Checkout |
| `/api/stripe/portal` | POST | Abre portal de billing |
| `/api/stripe/webhook` | POST | Webhook Stripe (eventos de pagamento) |
| `/api/storage/cleanup` | — | Limpeza de storage |

---

## 4. Decisões Técnicas

| Decisão | Escolha | Razão |
|---------|---------|-------|
| Router | App Router (Next.js 16) | Padrão moderno, Server/Client Components |
| Middleware | `proxy.ts` | Autenticação Supabase SSR, protege rotas privadas |
| SEO | `layout.tsx` por rota | Next.js exige Server Components para metadata |
| Tema | ThemeProvider (Context API) | `localStorage` key `homeai_theme` |
| Responsividade | `md:` breakpoint 768px | Mobile-first |
| Dev server | `next dev --webpack` | Flag `--webpack` explícita |
| Motor IA | fal.ai Flux Kontext | Image-to-image com prompts inteligentes por estilo |
| Créditos | Cascata paid→bonus→free | Refund automático em caso de erro |

---

## 5. Design System

| Elemento | Valor |
|----------|-------|
| Dark BG | `#0A0A0A` |
| Light BG | `#F4F4F5` |
| Dourado (accent) | `#D4AF37` |
| Azul (brand) | `#3B82F6` |
| Fonte títulos | Playfair Display (serif, `--font-playfair`) |
| Fonte corpo | Inter (sans, `--font-inter`) |
| Cards desktop | `rounded-[2.5rem]` |
| Cards mobile | `rounded-3xl` |
| Logo | "Home" (dourado) + "RenovAi" (azul) + SparklesIcon |

---

## 6. Regras Invioláveis

1. **NENHUMA funcionalidade pode ser alterada** durante ajustes de marketing/SEO
2. **Imagens do Supabase Storage** (geradas pelo usuário) NÃO devem ser otimizadas
3. **Root layout.tsx** — alterações apenas no objeto metadata
4. **proxy.ts** — NÃO modificar sem necessidade extrema
5. **NÃO desfazer**: vídeo `.webm`, `preload()` na home, GA com `lazyOnload`, setTimeout 400ms
6. **Responsividade**: sempre usar `md:` para proteger experiência desktop

---

## 7. URLs e Serviços

| Serviço | URL/ID |
|---------|--------|
| Produção | https://homerenovai.com |
| Dev local | http://localhost:3000 |
| Google Analytics | G-9VPVJCNYHH |
| Suporte | hello@homerenovai.com |
| Supabase/Stripe/fal.ai/Resend | Definidos em `.env.local` |

---

## 8. Observações para Próximo Agente IA

> ⚠️ **ATENÇÃO**:
> - A Fase 1 e Fase 2 de SEO estão 100% concluídas
> - Lighthouse Score estável: 88 Performance | 100 Best Practices | 100 SEO | 95 Accessibility
> - As otimizações de vídeo (.webm, preload react-dom, lazyOnload) são os componentes que sustentam o score
> - O app está em fase de MONETIZAÇÃO ATIVA — foco em aquisição de usuários
> - Rode `npm run dev` para testar localmente na porta 3000
> - Consulte `docs/PLANO_MONETIZACAO.md` para a estratégia de marketing
> - Consulte `docs/PARECER_PROFISSIONAL.md` para assessment técnico atualizado
