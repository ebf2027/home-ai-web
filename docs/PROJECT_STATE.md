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
# 🚀 PROJECT_STATE - HomeRenovAi

## 📌 1. Visão Geral & Arquitetura
- **Nome do App:** HomeRenovAi (Transição para nome oficial concluída)
- **Versão Atual:** v2.1.5 (Login Inteligente & UI Refinada)
- **Status:** 6.661 linhas de código real (.tsx e .css)
- **Tech Stack:** Next.js, Tailwind CSS, Supabase (Auth/DB), Stripe.
- **Identidade Visual:** Fundo Dark Profundo (#0A0A0A) com Acentos em Dourado Premium (#D4AF37).

## ✅ 2. Concluído Hoje (Vitórias Recentes)

### 🔐 Login "Nível App Store"
- **Correção iPhone:** Font-size em 16px e inputMode="email" para evitar zoom e garantir que o teclado suba na hora.
- **Inteligência por Link:** O app detecta automaticamente se o usuário veio de um link de indicação (?ref=) e muda o título de "Welcome Back" para "Start Creating".
- **Logo Onipresente:** Corrigida a visibilidade do logo no Desktop (removido md:hidden).

### 🎨 Feedback Visual Premium
- **Mensagens Inteligentes:** Sistema de cores translúcidas com efeito vidro (backdrop-blur).
  - Sucesso (Criar conta): Verde suave translúcido.
  - Erro: Vermelho suave translúcido.

### ⚙️ Infraestrutura Supabase
- Ajuste de Rate Limits para evitar bloqueios durante testes de tráfego.
- Normalização para reconhecimento de e-mails reais (Confirm Email: ON).

## 🎯 3. Próximos Passos (Missões de Amanhã)

### 🔗 A. Migração de Domínio (Vercel) - PRIORIDADE 1
- [ ] Renomear projeto de 'home-ai-web' para 'homerenovai' no painel da Vercel.
- [ ] Atualizar URLs de Redirecionamento (Callback) no Supabase.
- [ ] Atualizar Endpoints de Webhook no Stripe para o novo domínio.

### 📧 B. Profissionalização de E-mail (SMTP) - NOVO
- [ ] Configurar provedor SMTP (Resend) para envio ilimitado de e-mails de confirmação.

## 💾 4. Regra de Ouro do Desenvolvimento
- **Proteção do Desktop:** Sempre usar o prefixo md: para ajustes Mobile, garantindo que o "Big Screen Experience" do computador permaneça intacto e luxuoso.
# Status do Projeto - HomeRenovAi

## 📌 Visão Geral
Aplicação de design de interiores baseada em IA que permite aos usuários transformar fotos de cômodos em diferentes estilos.
- **Domínio Oficial:** https://homerenovai.com
- **Plataforma:** Next.js + Supabase + Stripe + Vercel

## 🚀 Marcos Alcançados hoje
- **Configuração de Domínio:** O app foi migrado com sucesso para o domínio `homerenovai.com`.
- **Catálogo Stripe:** Produtos renomeados para "HomeRenovAi Pro" e "HomeRenovAi Pro+".
- **Correção de Webhook:** A URL de destino foi corrigida para `https://homerenovai.com/api/stripe/webhook`, resolvendo o erro 405 e habilitando o status "200 OK".
- **Fluxo de Pagamento:** Testado e aprovado. O sistema atualiza o perfil de "Pro" para "Pro+" automaticamente após a compra de teste.
- **Redirecionamento:** Configurado para levar o usuário de volta para `/success` após o pagamento concluído.

## ⚙️ Regras de Negócio Definidas
- **Créditos:** Ficou decidido que os créditos **não são acumulativos**. Ao renovar ou fazer upgrade, o saldo é redefinido para o valor total do novo plano.
- **Segurança:** O `middleware.ts` está configurado para proteger rotas privadas, mantendo a rota `/api/stripe/webhook` aberta para comunicações do Stripe.

## 🛠️ Próximos Passos (Amanhã)
1. **Ajuste de UI:** Adicionar texto explicativo na página de `upgrade` informando que os créditos não são acumulativos.
2. **E-mails:** Iniciar a configuração do **Resend** para envio de e-mails transacionais (boas-vindas, confirmação de compra, etc).
3. **Produção:** Preparar a transição das chaves de API e links do Stripe do "Modo de Teste" para o "Modo Real".

## 📝 Notas Técnicas
- O projeto interno no VS Code ainda mantém o nome da pasta como `home-ai-web` para preservar as conexões de Deploy e Git.
- Sempre realizar **Commit** e **Sync Changes** no VS Code para aplicar mudanças no site real.
🚀 PROJECT_STATE - HomeRenovAi
📌 1. Visão Geral & Arquitetura
Nome do App: HomeRenovAi

Versão Atual: v2.2.0 (Comunicação Ativa & Identidade Visual)

Tech Stack: Next.js, Tailwind CSS, Supabase, Stripe, Resend (E-mails).

Identidade Visual: Ícones brancos com detalhes dourados em 3D, fundo Dark Profundo (#0A0A0A).

✅ 2. Vitórias de Hoje (3 de Março)
🎨 Identidade Visual & PWA
Novos Ícones: Versão branca/dourada implementada e testada com sucesso na tela inicial do iOS.

UI de Upgrade: Adicionado aviso legal informando que os créditos não são acumulativos e resetam na renovação.

📧 Motor de E-mails (Resend)
Domínio Verificado: homerenovai.com 100% autenticado no Resend via registros DNS na Vercel.

API de Envio: Criada a rota /api/send-welcome usando técnica de HTML estático para garantir compatibilidade com Next.js 16.

Teste Manual: E-mail de boas-vindas disparado e recebido com sucesso (atualmente caindo no spam, aguardando maturação do domínio).

💳 Pagamentos (Stripe)
Estabilidade: Webhook operando em 200 OK no domínio oficial.

🎯 3. Próximos Passos (Missões de Amanhã)
🔗 A. Automação de Boas-Vindas (Supabase) - PRIORIDADE 1
[ ] Conectar o gatilho de envio de e-mail ao processo de cadastro real do usuário.

[ ] Configurar o campo "Reply-to" para que respostas de clientes cheguem ao e-mail pessoal do Emerson.

⚙️ B. Preparação para Produção (Live Mode)
[ ] Trocar chaves de API do Stripe de "Test" para "Live".

[ ] Realizar um deploy final na Vercel para limpar páginas de teste (como a /test-email).

💾 4. Regra de Ouro do Desenvolvimento
Proteção do Desktop: Manter o prefixo md: em todos os ajustes para não quebrar a experiência de tela grande enquanto refinamos o mobile.
🚀 PROJECT_STATE - HomeRenovAi
📌 1. Visão Geral & Arquitetura
Versão Atual: v2.2.5 (PWA Estável & Infra de E-mail Pronta).

Tech Stack: Next.js 16.1.1 (Turbopack), Tailwind CSS, Supabase (Auth/DB), Stripe, Resend.

Identidade Visual: Fundo Dark Profundo (#0A0A0A) com Acentos em Dourado Premium (#D4AF37).

✅ 2. Vitórias Alcançadas (4 de Março)
PWA Imbatível: Captura global do prompt de instalação via window no layout.tsx, resolvendo a "corrida" do navegador e permitindo instalação no Desktop e Android.

Deploy Verde: Superados os erros de build relacionados ao Resend e caminhos de pastas.

Segurança de Infra: Transição de middleware.ts para proxy.ts concluída e operacional no Next.js 16.

Configuração de Suporte: Campo replyTo configurado para direcionar respostas de clientes ao e-mail pessoal.

🛠️ 3. Status da Automação de E-mail
Infraestrutura: Rota /api/send-welcome e componente WelcomeTrigger.tsx implementados.

Ponto de Atenção: O gatilho de boas-vindas foi integrado ao layout.tsx, mas o disparo automático ainda não foi validado (o campo welcome_sent permanece FALSE no banco).

🎯 4. Próximos Passos (Missão de Amanhã)
Investigação do Gatilho: Verificar por que o WelcomeTrigger não está disparando a chamada para a API (possível necessidade de logs de erro ou ajuste na permissão da rota no proxy.ts).

Teste de Fluxo: Confirmar se o link de confirmação do Supabase está redirecionando o usuário para a página correta onde o gatilho está ativo.

Validação Final: Garantir que o campo welcome_sent mude para TRUE após o login de um novo usuário.

💾 5. Regra de Ouro
Proteção do Desktop: Manter o uso do prefixo md: para ajustes mobile, garantindo que o layout premium de tela grande permaneça intacto.
# 🚀 PROJECT_STATE - HomeRenovAi

## 📌 1. Visão Geral & Arquitetura
- **Nome do App:** HomeRenovAi
- **Versão Atual:** v2.3.0 (Migração para High-End IA)
- **Tech Stack:** Next.js, Tailwind CSS, Supabase, Stripe, fal.ai (Novo motor de IA).
- **Identidade Visual:** Fundo Dark Profundo (#0A0A0A) com Acentos em Dourado Premium (#D4AF37).

## ✅ 2. Vitórias de Hoje (5 de Março)

### 🤖 Migração de Motor de IA (fal.ai)
- **Modelo Implementado:** `fal-ai/flux-kontext/dev` – substituição completa da OpenAI para Image-to-Image.
- **Ajuste de Fidelidade:** Configurado `guidance_scale: 10` e `num_inference_steps: 35` para garantir que as alterações de estilo sejam profundas e realistas.
- **Infraestrutura:** Instalação e configuração do SDK oficial `@fal-ai/client`.

### 💾 Correção do Sistema de Downloads
- **Download Direto (Home/Gallery):** Implementada a lógica de "Blob Download" que força o navegador a baixar o arquivo na pasta de downloads, eliminando a janela de compartilhamento indesejada no Desktop.
- **Modo Cinema:** Botão de download também sincronizado dentro do visualizador ampliado da galeria.

### 🛠️ Estabilidade de Código
- **Limpeza de Arquivos:** Remoção de funções obsoletas da OpenAI no `api/generate/route.ts`, reduzindo a complexidade e eliminando erros de sintaxe (Return statements/Declarations).

## 🎯 3. Próximos Passos (Missões Atuais)
- [ ] **Otimização de Custos:** Testar o modelo `schnell` com `guidance_scale` ajustado para comparar se a economia compensa a diferença de qualidade.
- [ ] **Automação de Boas-Vindas:** Finalizar o gatilho do Resend para novos cadastros.

## 💾 4. Regra de Ouro do Desenvolvimento
- **Proteção do Desktop:** Manter o prefixo `md:` em todos os ajustes para garantir que a "Big Screen Experience" permaneça intacta enquanto refinamos o mobile.