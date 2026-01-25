import type { GalleryItem } from "../types/gallery";

export const GALLERY_LS_KEY = "home_ai_gallery";

// Mantém a galeria leve para não estourar o localStorage
const MAX_GALLERY_ITEMS = 60;

// Salva com segurança (se der erro, não quebra o app)
function safeSetLocalStorage(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function getGallery(): GalleryItem[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(GALLERY_LS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function addToGallery(item: GalleryItem) {
  if (typeof window === "undefined") return;

  const current = getGallery();

  // Limita a quantidade de itens para evitar travar o app
  const updated = [item, ...current].slice(0, MAX_GALLERY_ITEMS);

  // Tenta salvar
  const ok = safeSetLocalStorage(GALLERY_LS_KEY, JSON.stringify(updated));

  // Se falhar (localStorage cheio), salva só os 20 mais recentes
  if (!ok) {
    const smaller = updated.slice(0, 20);
    safeSetLocalStorage(GALLERY_LS_KEY, JSON.stringify(smaller));
  }
}
