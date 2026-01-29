# PROJECT STATE — HOME-AI-WEB

## 1. Visão geral
- **Nome do app:** Home AI
- **Tipo:** Web App (MVP)
- **Objetivo:** Permitir que o usuário envie uma foto de um ambiente e gere variações de design de interiores usando IA.
- **Status atual:** MVP funcional com autenticação (Home + Gallery + Profile + Upgrade), persistência por usuário no **Supabase (Postgres + Storage)**, com **deleção correta** (DB + arquivos no Storage) e rota de **limpeza de órfãos**.

---

## 2. Stack / Tecnologias
- **Framework:** Next.js (App Router)
- **Linguagem:** TypeScript
- **UI / Estilo:** Tailwind CSS
- **Estado:** React hooks (useState, useEffect, useMemo)
- **Backend:** API Routes (Next)
- **IA de imagem:** OpenAI (Images API)
- **Autenticação:** Supabase Auth (Email/Senha + Google OAuth)
- **Persistência (Gallery):**
  - **Supabase Postgres** (tabela `public.gallery_items`) + RLS por usuário
  - **Supabase Storage** (bucket `homeai`) para armazenar arquivos de imagem
- **Persistência local:**
  - `sessionStorage`: “último resultado” na Home
  - `localStorage`: tema (dark/light)
- **Deploy:** Vercel + GitHub

---

## 3. Estrutura real de pastas (atual)
HOME-AI-WEB/
├─ app/
│ ├─ api/
│ │ ├─ generate/
│ │ │ └─ route.ts
│ │ └─ storage/
│ │ └─ cleanup/
│ │ └─ route.ts
│ ├─ auth/
│ │ └─ callback/
│ │ └─ route.ts
│ ├─ login/
│ │ └─ page.tsx
│ ├─ components/
│ │ ├─ BottomTabs.tsx
│ │ └─ gallery/
│ │ ├─ GalleryGrid.tsx
│ │ └─ GalleryModal.tsx
│ ├─ gallery/
│ │ └─ page.tsx
│ ├─ lib/
│ │ ├─ supabase/
│ │ │ ├─ client.ts
│ │ │ └─ server.ts
│ │ ├─ galleryDb.ts
│ │ ├─ resolveImageSrc.ts
│ │ └─ storageImages.ts
│ ├─ profile/
│ │ └─ page.tsx
│ ├─ types/
│ │ └─ gallery.ts
│ ├─ upgrade/
│ │ └─ page.tsx
│ ├─ favicon.ico
│ ├─ globals.css
│ ├─ layout.tsx
│ └─ page.tsx
├─ docs/
│ └─ PROJECT_STATE.md
├─ public/
├─ .env.local
├─ package.json
├─ tsconfig.json
├─ next.config.ts
└─ proxy.ts (proteção de rotas; substitui middleware.ts)

markdown
Copiar código

---

## 4. Páginas principais

### app/page.tsx (Home)
- Upload da imagem do ambiente
- Seleção de estilo (Modern, Minimalist, Scandinavian, etc.)
- Geração da imagem via `POST /api/generate`
- Exibição de preview / before-after slider
- Menu de ações com 3 opções: **Share / Open / Clear**
- Último resultado salvo em `sessionStorage` (`homeai_last_result`)
- Ao gerar:
  - salva a geração no Supabase (registro no Postgres + arquivos no Storage)
- Download:
  - “força download” via `fetch -> blob -> URL.createObjectURL`

### app/gallery/page.tsx (Gallery)
- Lista imagens do usuário carregando do Supabase (tabela `gallery_items`)
- Filtro de favoritos
- Favoritar/desfavoritar (`update is_favorite`)
- **Delete completo:** remove arquivos do **Storage** (imagem + thumb) e depois remove o registro no **DB**
- Botão Refresh

### app/login/page.tsx
- Formulário de login Email/Senha
- Botão “Continue with Google”
- Após login, redireciona para rota solicitada via `next=...`

### app/profile/page.tsx
- Página de perfil (placeholder no MVP)

### app/upgrade/page.tsx
- Página de upgrade / monetização (placeholder no MVP)

---

## 5. Autenticação e proteção de rotas

### Google OAuth
- Configurado no Google Cloud (OAuth Client ID + Secret)
- Redirect/callback do Supabase:
  - `https://<project>.supabase.co/auth/v1/callback`

### Callback route
- `app/auth/callback/route.ts`
- Faz `exchangeCodeForSession(code)` e seta cookies corretamente

### Proteção de rotas
- `proxy.ts` (substitui middleware.ts)
- Redireciona usuário não logado para `/login?next=...`
- **Opção escolhida:** B (login já ao abrir o app)
- Home `/` também é protegida

---

## 6. Supabase — Banco de dados + Storage

### 6.1 Tabela: `public.gallery_items`
Campos:
- `id` uuid primary key
- `user_id` uuid (FK `auth.users`)
- `created_at` timestamptz default now()
- `room_type` text
- `style` text
- `prompt` text
- `image_url` text  **(path do Storage, não base64)**
- `thumb_url` text nullable **(path do Storage)**
- `is_favorite` boolean default false

### 6.2 RLS (Postgres)
- RLS habilitado na tabela
- Policies por usuário para select/insert/update/delete usando `auth.uid() = user_id`

### 6.3 Storage
- **Bucket:** `homeai`
- **Estrutura de arquivos:** tudo dentro da pasta do usuário:
  - `{userId}/{uuid}.jpg`
  - `{userId}/{uuid}-thumb.jpg`
  - (uploads manuais também seguem `{userId}/arquivo.ext`)

### 6.4 Policies (Storage)
- Policies configuradas para **authenticated** em:
  - SELECT / INSERT / UPDATE / DELETE
- Regra usada (padrão do projeto):
  - permitir acesso apenas a objetos cujo “primeiro folder” do path é o próprio `auth.uid()`

### 6.5 Consistência Storage x DB
- **Delete no app** remove:
  1) arquivos no Storage (imagem + thumb)
  2) linha no Postgres (`gallery_items`)

- **Rota utilitária de limpeza de órfãos (dev/admin):**
  - `GET /api/storage/cleanup`
  - compara lista do Storage (pasta do user) com registros do DB e remove arquivos órfãos
  - útil quando existirem sobras antigas por testes/migrações

---

## 7. Variáveis de ambiente (.env.local)
(sem valores aqui)
- `OPENAI_API_KEY=...`
- `NEXT_PUBLIC_SUPABASE_URL=...`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY=...`
- `SUPABASE_SERVICE_ROLE_KEY=...`

> Observação: `SUPABASE_SERVICE_ROLE_KEY` é **somente servidor** (API routes), nunca usar no client.

---

## 8. Persistência de dados
- Gallery: Supabase Postgres (metadados) + Supabase Storage (arquivos), por usuário
- Última imagem da Home: `sessionStorage` (`homeai_last_result`)
- Tema: `localStorage` (`homeai_theme`)

---

## 9. Fluxo do usuário (atual)
1) Usuário abre o app → vai para `/login`  
2) Faz login (Google ou Email/Senha)  
3) Entra na Home  
4) Faz upload e escolhe estilo  
5) Gera imagem com IA  
6) App salva automaticamente no Supabase (DB + Storage)  
7) Usuário abre Gallery e vê histórico do próprio usuário  
8) Pode favoritar, deletar, baixar

---

## 10. Decisões já tomadas (não mudar sem discutir)
- Idioma do app: Inglês
- Foco em MVP
- UX simples, clean e mobile-first
- Gallery como histórico automático das gerações
- Login obrigatório ao abrir o app (Opção B)
- Storage organizado por pasta `{auth.uid()}/...`

---

## 11. Links importantes
- GitHub repo: `ebf2027/home-ai-web`
- Vercel project: `home-ai-web-2`
- Domain: `home-ai-web-2.vercel.app`
- Supabase project: `gphunbcamhetcuqqetvl`

---

## 12. Diário de atualização
### 26–28/01/2026 — Storage + delete completo + cleanup
- Bucket `homeai` no Supabase Storage em uso (arquivo + thumbnail).
- `gallery_items.image_url` e `thumb_url` passaram a ser **paths** do Storage (não base64).
- Policies do Storage ajustadas para `authenticated` (select/insert/update/delete) com regra por pasta `{auth.uid()}`.
- Gallery delete passou a remover **Storage + DB**.
- Criada rota `/api/storage/cleanup` para remover arquivos órfãos (dev/admin).
- Troubleshooting: quando Next “prende” validações antigas, limpar `.next` (incluindo `.next/dev`) resolve.

---

## 13. Próximo passo (próxima sessão)
- Deploy dessas mudanças na Vercel + conferir env vars no painel da Vercel
- Decidir se o bucket fica PUBLIC ou se migra para signed URLs (privado) com expiração
- Opcional: automatizar limpeza (cron) ou manter apenas rota admin protegida