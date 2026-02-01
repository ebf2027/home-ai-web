# PROJECT STATE — HOME-AI-WEB

## 1) Visão geral
- Nome do app: **Home AI**
- Tipo: Web App (MVP)
- Objetivo: Usuário envia uma foto de um cômodo e gera variações realistas de design de interiores com IA.
- Status atual: **MVP funcional em produção com login + gallery persistente no Supabase + room type.**

---

## 2) Produção / Links
- Repositório (GitHub): **ebf2027/home-ai-web**
- Produção (Vercel): **home-ai-web-2** (único projeto mantido)
- URL de produção: **https://home-ai-web-2.vercel.app**

---

## 3) Stack / Tecnologias
- Framework: **Next.js (App Router)**
- Linguagem: **TypeScript**
- UI: **Tailwind CSS**
- Auth/DB/Storage: **Supabase**
  - Auth: Email+Senha e Google OAuth
  - DB: tabela `gallery_items`
  - Storage: bucket `homeai`
- IA de imagem: **OpenAI Images Edits** via API Route
- Deploy: **Vercel**

---

## 4) Variáveis de ambiente
### Local (`.env.local`)
- `OPENAI_API_KEY=...`
- `NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY=...`

### Vercel (Production Environment Variables)
- Mesmas variáveis acima configuradas no projeto **home-ai-web-2**.

> Importante: `NEXT_PUBLIC_SUPABASE_URL` precisa ser uma URL válida HTTP/HTTPS (ex.: `https://...supabase.co`).

---

## 5) Rotas / Páginas principais (App Router)
- `/` → Home (upload + seleção de estilo + room type + gerar + salvar)
- `/gallery` → Gallery (lista do usuário via Supabase)
- `/login` → Login (Google + Email/Senha)
- `/profile` → Profile
- `/upgrade` → Upgrade (placeholder/fluxo futuro)
- `/auth/callback` → Callback do OAuth (troca code → session e redireciona para `next`)
- `/api/generate` → Geração com OpenAI (edits)
- `/api/storage/cleanup` → (existe no projeto) endpoint de manutenção/limpeza (se aplicável)

---

## 6) Fluxo de autenticação (Supabase)
- O usuário acessa `/login?next=/...`
- Pode autenticar via:
  - **Google OAuth** (`signInWithOAuth`)
  - **Email + senha** (`signInWithPassword`)
  - **Signup** (`signUp`) com confirmação por email (quando habilitado no Supabase)
- Após login, o app redireciona para o `next` (default `/`).
- Callback do OAuth: `/auth/callback?code=...&next=...`

Arquivos relevantes:
- `app/login/page.tsx` (wrapper com Suspense quando necessário)
- `app/login/LoginClient.tsx` (UI/handlers reais)
- `app/auth/callback/route.ts` (troca code por session e redirect)
- `app/lib/supabase/client.ts` (supabase client-side)
- `app/lib/supabase/server.ts` (supabase server-side / cookies)

---

## 7) Fluxo de geração e salvamento (Home → OpenAI → Supabase)
### Home (`app/page.tsx`)
1. Usuário escolhe imagem (`Choose image`).
2. Usuário escolhe **Style**.
3. Usuário escolhe **Room type** (dropdown em inglês).
4. Clica **Generate Design**.
5. App:
   - Otimiza a imagem para upload (`prepareImageForUpload`)
   - Faz `POST /api/generate` (FormData: `style`, `roomType`, `image`)
   - Recebe imagem final (blob jpeg)
   - Gera thumbnail (jpeg)
   - Faz upload para Supabase Storage:
     - `homeai/{userId}/{imageId}.jpg`
     - `homeai/{userId}/{imageId}-thumb.jpg`
   - Cria registro no Supabase DB em `gallery_items` com:
     - `id`, `user_id`, `room_type`, `style`, `prompt`, `image_url`, `thumb_url`, `is_favorite`

### API de geração (`app/api/generate/route.ts`)
- Recebe FormData: `image`, `style` (+ agora `roomType`)
- Monta prompt com regras fortes:
  - preservar layout, portas/janelas, câmera etc.
- Chama OpenAI `POST https://api.openai.com/v1/images/edits`
- Retorna `image/jpeg` no response

Observação:
- Model atual: `gpt-image-1-mini`
- `size: "auto"`, `quality: "medium"`, `output_format: "jpeg"`
- Tem retry para status temporários (429/5xx) e timeout.

---

## 8) Gallery (persistente)
- Página: `app/gallery/page.tsx` + grid `app/components/gallery/GalleryGrid.tsx`
- Busca itens do usuário via Supabase (DB + URLs do Storage)
- Mostra cards com:
  - Thumb/Imagem
  - Room type
  - Style
  - Favoritar (star)
  - Download
  - Delete

> As imagens antigas (antes do Room Type) não precisam ser alteradas. Daqui pra frente todas as novas já salvam `room_type`.

---

## 9) UI adicionada hoje
### Room Type (Home)
- Dropdown entre estilos e botão de geração.
- Opções em inglês (ex.: Living room, Bedroom, Kitchen, …).
- `roomType` vai para o prompt e é salvo no DB como label.

### “Photo tips” (Home)
- Ajuda para o usuário tirar uma foto melhor.
- Abre uma modal com lista de dicas (em inglês).
- Ajustada para não ficar escondida atrás do bottom tabs (modal scrollável / padding bottom / z-index).

---

## 10) Deploy / Workflow
### Local
- `npm install`
- `npm run dev`
- testar login, geração, salvar no storage e aparecer na gallery.

### Produção (Vercel)
- Push no GitHub dispara deploy automático:
  - `git add .`
  - `git commit -m "..."`
  - `git push`

---

## 11) Problemas resolvidos hoje (histórico rápido)
- Build falhando por `useSearchParams` / Suspense no `/login` → corrigido com wrapper e/ou client component adequado.
- Erros de “Invalid supabaseUrl / missing env vars” em deploy → corrigido ajustando env vars na Vercel e valores do Supabase.
- Confusão de múltiplos projetos na Vercel → mantido apenas **home-ai-web-2** (funcionando).

---

## 12) Próximos passos (para finalizar em ~10 dias)
1. **Limites / Monetização**
   - Definir plano Free vs Pro (ex.: limite diário, estilos premium, resolução).
   - Implementar paywall no `/upgrade`.
2. **Pagamento**
   - Integrar Stripe (assinatura / lifetime).
3. **Hardening**
   - Melhorar mensagens de erro (OpenAI/Supabase).
   - Rate limit / proteção no `/api/generate`.
4. **UX**
   - Melhor “empty state” e microcopys.
   - Mostrar consumo de créditos (se houver).
5. **Legal/Produto**
   - Terms / Privacy / contato
   - Analytics básico (Vercel Analytics ou alternativa)
6. **Marketing**
   - Landing simples, demo images, CTA claro.

---