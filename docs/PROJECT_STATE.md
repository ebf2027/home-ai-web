# 🚀 PROJECT_STATE - HomeRenovAi

## 📌 1. Visão Geral & Arquitetura
- **Nome do App:** HomeRenovAi
- **Versão Atual:** v2.1.0 (MVP Premium Cross-Platform)
- **Tech Stack:** Next.js, Tailwind CSS, Supabase (Auth/DB), Stripe (Pagamentos).
- **Identidade Visual:** Fundo Dark Profundo (`#0A0A0A`) com Acentos em Dourado Premium (`#D4AF37`). Suporte total e persistente ao modo Light/Dark via `ThemeProvider`.
- **Layout Híbrido:** - *Desktop:* "Big Screen Experience" (Painéis duplos, Dock flutuante estilo Mac).
  - *Mobile:* "App Nativo" (Elementos edge-to-edge soltos na tela, Bottom bar).

## ✅ 2. O Que Já Está Pronto e Rodando (Core Features)

### 💳 Motor de Pagamentos (Stripe)
- Checkout e Billing Portal 100% integrados em ambiente de teste.
- Webhooks configurados escutando aprovações e automatizando cancelamentos.
- Tela de Upgrade inteligente: lê o banco de dados e bloqueia downgrades acidentais, mostrando o status real ("Current Plan" / "Included in your plan").

### 🤝 Sistema de Indicações (Referral Engine)
- Geração de link dinâmico de convite no Profile (`/login?ref=user_id`).
- Motor silencioso (ReferralTracker) que captura o código no Login e injeta +1 crédito automaticamente no banco de dados quando o amigo entra.

### 🎨 Refinamentos de UI/UX Concluídos
- **Home:** Fim da "Síndrome da Boneca Russa" no mobile. Workspace estável (aspecto 5/4), Photo Tips em glassmorphism interativo e textos dinâmicos que não somem no modo claro/escuro.
- **Profile:** Código limpo e otimizado. Integração de Estatísticas Reais (Total Designs / Estilo Favorito) vindas do Supabase, layout sem "buracos fantasmas" e seção de Help & Support.
- **Gallery:** Visual de luxo 100% finalizado (Masonry layout, botões otimizados).
- **Upgrade:** Cabeçalho milimetricamente alinhado e Cards com hierarquia ("Best Value" para o plano Pro+).

## 🎯 3. Próximos Passos (Missões Atuais)

### 📱 A. Transformar em Aplicativo Nativo (PWA) - *PRIORIDADE MÁXIMA*
- [ ] Gerar os ícones oficiais do app (tamanhos 192x192 e 512x512) na pasta `public`.
- [ ] Criar o arquivo `manifest.json` definindo as cores da marca e o nome do app.
- [ ] Instalar e configurar o pacote `next-pwa` para criar o Service Worker (que trará instalações nativas e atualizações invisíveis).

### 🔗 B. Migração de Domínio e Segurança Fixa
- [ ] Alterar o nome oficial do projeto no painel do **Vercel** para `homerenovai`.
- [ ] Atualizar as URLs permitidas no painel do **Supabase** (Authentication > URL Configuration).
- [ ] Atualizar as URLs de Redirecionamento (Success/Cancel) e os destinos de Webhook no painel do **Stripe**.

## 💾 4. Regra de Ouro do Desenvolvimento
- **Proteção do Desktop:** Sempre usar o prefixo `md:` do Tailwind ao ajustar espaçamentos e layouts para a versão Mobile. Isso garante que a versão Web continue blindada, luxuosa e com sua estrutura de painéis laterais intacta.