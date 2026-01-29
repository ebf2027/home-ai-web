import { NextResponse } from "next/server";
import { createClient } from "../../lib/supabase/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/";

  const safeNext = next.startsWith("/") ? next : "/";
  const redirectToLogin = new URL(`/login?next=${encodeURIComponent(safeNext)}`, url.origin);

  if (!code) return NextResponse.redirect(redirectToLogin);

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("exchangeCodeForSession error:", error);
      return NextResponse.redirect(redirectToLogin);
    }

    return NextResponse.redirect(new URL(safeNext, url.origin));
  } catch (e) {
    console.error("callback route error:", e);
    return NextResponse.redirect(redirectToLogin);
  }
}
