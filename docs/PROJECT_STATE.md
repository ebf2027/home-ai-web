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

🚀 PROJECT_STATE - HomeRenovAi
📌 1. Visão Geral & Arquitetura
Nome do App: HomeRenovAi

Versão Atual: v2.1.0 (MVP Premium Cross-Platform)

Tech Stack: Next.js, Tailwind CSS, Supabase (Auth/DB), Stripe (Pagamentos).

Identidade Visual: Fundo Dark Profundo (#0A0A0A) com Acentos em Dourado Premium (#D4AF37). Suporte total e persistente ao modo Light/Dark via ThemeProvider.

Layout Híbrido: - Desktop: "Big Screen Experience" (Painéis duplos, Dock flutuante estilo Mac).

Mobile: "App Nativo" (Elementos edge-to-edge soltos na tela, Bottom bar).

✅ 2. O Que Já Está Pronto e Rodando (Core Features)
💳 Motor de Pagamentos (Stripe)
Checkout e Billing Portal 100% integrados em ambiente de teste.

Webhooks configurados escutando aprovações e automatizando cancelamentos.

Tela de Upgrade inteligente: lê o banco de dados e bloqueia downgrades acidentais.

🤝 Sistema de Indicações (Referral Engine)
Geração de link dinâmico de convite no Profile (/login?ref=user_id).

Motor silencioso (ReferralTracker) que captura o código no Login e injeta +1 crédito.

🎨 Refinamentos de UI/UX Concluídos
Home: Fim da "Síndrome da Boneca Russa" no mobile. Workspace estável.

Profile: Integração de Estatísticas Reais vindas do Supabase e layout limpo.

Gallery: Visual de luxo 100% finalizado (Masonry layout, botões otimizados).

Upgrade: Cabeçalho milimetricamente alinhado e Cards com hierarquia.

📱 Aplicativo Nativo (PWA) - NOVO
Ícones oficiais gerados e configurados (icon-192x192.png, icon-512x512.png e apple-touch-icon.png).

manifest.json com identidade visual configurada em inglês.

Motor next-pwa ativado com fallback de webpack para ambiente de desenvolvimento.

Nota de Segurança: Sempre verificar o painel de Deployments da Vercel (bolinha vermelha) caso atualizações não reflitam em produção.

🎯 3. Próximos Passos (Missões Atuais)
🔗 A. Migração de Domínio e Segurança Fixa - NOVA PRIORIDADE MÁXIMA
[ ] Alterar o nome oficial do projeto no painel do Vercel para homerenovai.

[ ] Atualizar as URLs permitidas no painel do Supabase (Authentication > URL Configuration).

[ ] Atualizar as URLs de Redirecionamento (Success/Cancel) e os destinos de Webhook no painel do Stripe.

💾 4. Regra de Ouro do Desenvolvimento
Proteção do Desktop: Sempre usar o prefixo md: do Tailwind ao ajustar espaçamentos e layouts para a versão Mobile. Isso garante que a versão Web continue blindada, luxuosa e com sua estrutura de painéis laterais intacta.

Gemini said
Com certeza, esse detalhe do teclado e do e-mail é prioridade máxima para amanhã. Realmente, usar "name@gmail.com" pode confundir quem usa Outlook ou iCloud; o ideal é algo neutro como "seu-email@exemplo.com" ou apenas "E-mail".

Aqui está o seu project_state.md atualizado com as vitórias de hoje e os alertas para amanhã. Pode copiar e colar no seu arquivo:

Project State - HomeRenovAi
Versão: 2.1.0 - MVP Premium (Blindado)
Status: Ajustes Finais de UI & Segurança de Sessão

🎯 O que resolvemos hoje:
PWA / Instalação: O botão de instalar agora é inteligente. Ele detecta se o app já está instalado (Desktop/Mobile) e se esconde automaticamente. Ajustamos o texto do manual para Safari/Chrome no iOS para ser "à prova de falhas".

Foto de Perfil: Problema da "foto fantasma" resolvido com técnica de cache-buster (?t=timestamp). A foto agora permanece fixa ao navegar entre as abas. Adicionada a função "Remove Photo" para resetar o avatar.

Galeria: Visibilidade dos textos de "Nenhum design encontrado" corrigida para Mobile, com cores inteligentes para modo claro (preto) e modo escuro (branco).

Segurança (Acesso Restrito): Implementada trava de segurança dupla. O middleware.ts agora bloqueia instantaneamente acessos deslogados às páginas /, /gallery, /profile e /upgrade.

🛠️ Tecnologias e Estética
Cores: Dark Profundo (#0A0A0A) e Dourado Executive (#D4AF37).

Stack: Next.js (App Router), Supabase (Auth/Storage/DB), Tailwind CSS.

🔴 Pendências Urgentes (Para Amanhã):
Bug do Teclado no Login: Corrigir os campos de E-mail e Password que não estão ganhando foco/abrindo o teclado no iPhone.

Refatoração do Login: Alterar o texto do placeholder de e-mail para algo genérico e garantir que o clique nos campos funcione em toda a área.

Migração de Domínio: (Aguardando sinal verde) Alterar nome na Vercel e atualizar as URLs de retorno no Supabase e Stripe.