# PROJECT STATE — HOME-AI-WEB

## 1. Visão geral
- Nome do app: Home AI
- Tipo: Web App (MVP)
- Objetivo: Permitir que o usuário envie uma foto de um ambiente e gere variações de design de interiores usando IA.
- Status atual: MVP funcional (Home + Gallery + Profile + Upgrade)

---

## 2. Stack / Tecnologias
- Framework: Next.js (App Router)
- Linguagem: TypeScript
- UI / Estilo: Tailwind CSS
- Estado: React hooks (useState, useEffect, useMemo)
- Backend: API Route (app/api/generate/route.ts)
- IA de imagem: OpenAI (Images API)
- Persistência local: localStorage (galleryStorage.ts)
- Deploy: ainda não definido

---

## 3. Estrutura real de pastas

```txt
HOME-AI-WEB/
├─ app/
│  ├─ api/
│  │  └─ generate/
│  │     └─ route.ts
│  ├─ components/
│  │  ├─ BottomTabs.tsx
│  │  └─ gallery/
│  │     ├─ GalleryGrid.tsx
│  │     └─ GalleryModal.tsx
│  ├─ gallery/
│  │  └─ page.tsx
│  ├─ lib/
│  │  └─ galleryStorage.ts
│  ├─ profile/
│  │  └─ page.tsx
│  ├─ types/
│  │  └─ gallery.ts
│  ├─ upgrade/
│  │  └─ page.tsx
│  ├─ favicon.ico
│  ├─ globals.css
│  ├─ layout.tsx
│  └─ page.tsx
├─ docs/
│  └─ PROJECT_STATE.md
├─ public/
├─ .env.local
├─ package.json
├─ tsconfig.json
└─ next.config.ts
4. Páginas principais
app/page.tsx (Home)

Tela principal do app

Upload da imagem do ambiente

Seleção de estilo (Modern, Minimalist, Scandinavian, etc.)

Geração da imagem via /api/generate

Exibição de preview / before-after slider

Menu de ações com 3 opções:

Share

Open

Clear

Último resultado salvo em sessionStorage

Ao gerar imagem:

Converte para dataURL

Salva automaticamente na Gallery via addToGallery

app/gallery/page.tsx (Gallery)

Lista todas as imagens geradas

Dados carregados do localStorage (GALLERY_LS_KEY)

Filtro de favoritos

Abre imagem em modal (GalleryModal)

Permite favoritar / desfavoritar

Permite download da imagem

app/profile/page.tsx

Página de perfil (placeholder no MVP)

app/upgrade/page.tsx

Página de upgrade / monetização (placeholder no MVP)

5. Componentes principais
GalleryGrid.tsx

Exibe as imagens da galeria em formato de grid

Cada card contém:

Thumbnail da imagem

Informações (ambiente, estilo, data)

Botão de favoritar

Botão de download

Clique no card abre o modal

GalleryModal.tsx

Modal para visualização ampliada da imagem

Mostra:

Imagem em tamanho grande

Tipo de ambiente

Estilo

Data

Ações disponíveis:

Favoritar

Download

Fechar

Fecha com ESC ou clique fora

BottomTabs.tsx

Navegação inferior fixa

Tabs:

Home

Gallery

Profile

Upgrade

6. Tipos importantes
GalleryItem (types/gallery.ts)

id: string

createdAt: string

roomType: string

style: string

prompt: string

thumbUrl: string

imageUrl: string

isFavorite: boolean

7. Fluxo do usuário

Usuário entra na Home

Escolhe uma imagem do ambiente

Seleciona um estilo

Gera a imagem com IA

Visualiza preview / comparação

Imagem é salva automaticamente na Gallery

Usuário acessa a Gallery

Pode abrir, favoritar, baixar ou filtrar imagens

8. Persistência de dados

Gallery:

Salva no localStorage

Chave: GALLERY_LS_KEY

Última imagem da Home:

Salva em sessionStorage

Tema (dark/light):

Salvo em localStorage

9. Decisões já tomadas (não mudar sem discutir)

Idioma do app: Inglês

Foco em MVP

Persistência local primeiro (sem backend)

UX simples, clean e mobile-first

Gallery como histórico automático das gerações

10. Objetivo deste arquivo

Este arquivo representa a memória oficial do projeto.
Sempre que houver dúvidas, bugs ou novas funcionalidades:

Este documento deve ser considerado a fonte da verdade

Alterações estruturais devem ser refletidas aqui