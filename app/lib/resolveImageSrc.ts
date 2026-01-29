"use client";

import { createClient } from "@/app/lib/supabase/client";

export function resolveImageSrc(value?: string | null) {
  if (!value) return "";
  if (value.startsWith("data:")) return value; // imagens antigas (base64)

  // imagens novas (path no Storage)
  const supabase = createClient();
  return supabase.storage.from("homeai").getPublicUrl(value).data.publicUrl;
}
