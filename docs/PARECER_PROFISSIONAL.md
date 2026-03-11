# 🎯 Parecer Profissional — HomeRenovAI

> Análise completa do estado atual do app. Gerado em 10 de Março de 2026.

---

## ✅ O que está muito bem feito

1. **Arquitetura sólida** — Next.js 16 App Router com separação clara entre client/server/admin no Supabase. Nível profissional de organização.

2. **Motor de IA inteligente** — Prompts com detecção automática interior vs. fachada + dicionário de materiais por estilo. `guidance_scale` variável (10 interior / 13 fachada).

3. **Sistema de créditos robusto** — Consumo em cascata (paid → bonus → free) com **refund automático** em caso de erro. Poucos SaaS grandes implementam isso.

4. **Webhooks Stripe com idempotência** — Tabela `stripe_events` para evitar processamento duplicado. Engenharia séria.

5. **PWA bem configurada** — Detecção de standalone mode, captura global do install prompt, suporte iOS/Android.

6. **Layout híbrido Desktop/Mobile** — Estratégia do `md:` prefix para proteger desktop enquanto refina mobile.

---

## ⚠️ O que falta para estar 100% pronto

### 🔴 Crítico (Fazer antes de monetizar)

- [ ] **1. Stripe em modo LIVE** — Trocar `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` e os `PRICE_ID`s na Vercel para as chaves de produção. Atualizar URL do webhook.
- [ ] **2. Validar WelcomeTrigger** — O campo `welcome_sent` permanece `FALSE`. Verificar se o e-mail dispara em produção. O Supabase client é criado fora do `useEffect`, pode causar re-renders.
- [ ] **3. Remover pacote `openai`** — SDK da OpenAI (`^6.16.0`) ainda no `package.json`. ~2MB de peso morto (migração para fal.ai já concluída).

### 🟡 Importante (Fazer antes de escalar)

- [ ] **4. Tratamento de erros na UI** — Se a API do fal.ai cair, falta UI amigável (ex: "Nossos servidores estão ocupados, tente novamente").
- [ ] **5. Rate Limiting nas API Routes** — Sem proteção contra abuso em `/api/generate`. Considerar Upstash Ratelimit.
- [ ] **6. Testes automatizados** — Zero testes. Pelo menos fluxos de crédito e webhook precisam de cobertura.
- [ ] **7. SEO básico** — Páginas sem `<meta description>`. Home é client-side, Google vê pouco conteúdo.
- [ ] **8. Landing page pública** — A rota `/` redireciona para `/login`. Não existe página de vendas. Visitantes novos não entendem o produto.

### 🟢 Nice-to-have (Fazer depois)

- [ ] **9. Centralizar componentes duplicados** — Ícones/dock repetidos entre Home, Gallery, Profile, Upgrade.
- [ ] **10. Analytics** — Vercel Analytics, PostHog ou Mixpanel para entender comportamento do usuário.
- [ ] **11. Push Notifications** — Notificações via PWA.
- [ ] **12. Compartilhamento social** — OG Image preview para imagens geradas.

---

## 💰 Roteiro de Monetização

### Passo 1 — Go Live (1-2 dias)
- [ ] Criar produtos **reais** no Stripe (não os de teste)
- [ ] Copiar novos `PRICE_ID`s para variáveis de ambiente na Vercel
- [ ] Trocar `STRIPE_SECRET_KEY` e `STRIPE_WEBHOOK_SECRET` para chaves live
- [ ] Atualizar URL do webhook: `https://homerenovai.com/api/stripe/webhook`
- [ ] Fazer pagamento real de teste com cartão próprio

### Passo 2 — Landing Page (2-3 dias)
- [ ] Criar página pública em `/` (sem redirect para login) com:
  - Hero section com before/after de exemplos reais
  - Tabela de preços clara
  - Depoimentos (mesmo que iniciais)
  - CTA forte ("Try 3 Free Designs")
  - SEO otimizado (meta tags, OG Image)

### Passo 3 — Aquisição de Usuários

| Canal | Custo | Potencial |
|---|---|---|
| **TikTok/Reels** | Grátis | 🔥 Alto — Vídeos before/after viralizam |
| **Pinterest** | Grátis | 🔥 Alto — Público de decoração é enorme |
| **Instagram Ads** | ~R$20-50/dia | Médio |
| **Google Ads** | ~R$30-80/dia | Médio |
| **Product Hunt** | Grátis | Alto para primeiro pico |
| **Reddit** (r/InteriorDesign) | Grátis | Médio |

### Passo 4 — Pricing Sugerido

| Plano | Créditos | Preço Sugerido |
|---|---|---|
| **Free** | 3 para sempre | $0 |
| **Pro** | 100/mês | $9.90/mês |
| **Pro+** | 300/mês | $19.90/mês |

---

## 📊 Veredicto Final

> **O app está em ~85% de prontidão para monetização.** A engenharia do backend (Stripe, créditos, webhooks) é sólida e profissional. Faltam os **15% de go-to-market**: ativar Stripe live, criar landing page de vendas, remover peso morto.

> O código é limpo, bem organizado e tem fundamentos de segurança (middleware, idempotência, refund). Para um projeto indie, está **acima da média**. Com os ajustes acima, pode começar a aceitar pagamentos reais em 1-2 dias.
