import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const ANON =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
  const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!SUPABASE_URL || !ANON || !SERVICE) {
    return NextResponse.json(
      { error: "Missing env vars: NEXT_PUBLIC_SUPABASE_URL / ANON_KEY (or PUBLISHABLE_KEY) / SUPABASE_SERVICE_ROLE_KEY" },
      { status: 500 }
    );
  }

  // Usuário logado (via cookies)
 const cookieStore = await cookies();

  const supabaseUser = createServerClient(SUPABASE_URL, ANON, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: () => {}, // não precisamos setar cookie aqui
    },
  });

  const { data: udata, error: uerr } = await supabaseUser.auth.getUser();
  if (uerr || !udata.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const userId = udata.user.id;

  // Admin (service role) para listar/remover no Storage
  const admin = createClient(SUPABASE_URL, SERVICE, {
    auth: { persistSession: false },
  });

  // 1) pega do DB tudo que deve ser mantido
  const { data: rows, error: dbErr } = await admin
    .from("gallery_items")
    .select("image_url, thumb_url")
    .eq("user_id", userId);

  if (dbErr) {
    return NextResponse.json({ error: "DB read failed: " + dbErr.message }, { status: 500 });
  }

  const keep = new Set<string>();

  for (const r of rows ?? []) {
    if (r.image_url) keep.add(r.image_url);
    if (r.thumb_url) keep.add(r.thumb_url);

    // fallback: se não houver thumb_url salvo, tentamos inferir "-thumb"
    if (r.image_url) {
      const m = r.image_url.match(/^(.*)(\.[^.\/]+)$/);
      if (m) keep.add(`${m[1]}-thumb${m[2]}`);
    }
  }

  // 2) lista arquivos no folder do usuário
  const { data: objs, error: listErr } = await admin.storage
    .from("homeai")
    .list(userId, { limit: 1000, offset: 0 });

  if (listErr) {
    return NextResponse.json({ error: "Storage list failed: " + listErr.message }, { status: 500 });
  }

  const allPaths = (objs ?? [])
    .filter((o) => o.name && !o.name.endsWith("/"))
    .map((o) => `${userId}/${o.name}`);

  // 3) remove os órfãos
  const orphans = allPaths.filter((p) => !keep.has(p));

  if (orphans.length > 0) {
    const { error: rmErr } = await admin.storage.from("homeai").remove(orphans);
    if (rmErr) {
      return NextResponse.json(
        { error: "Storage remove failed: " + rmErr.message, orphans },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({
    ok: true,
    userId,
    totalInStorage: allPaths.length,
    totalKeptFromDb: keep.size,
    removedCount: orphans.length,
    removedPaths: orphans,
  });
}
