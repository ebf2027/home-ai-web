import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        get(name: string) {
          const v = (cookieStore as any).get(name);
          // em algumas versões retorna { value }, em outras retorna string
          return typeof v === "string" ? v : v?.value;
        },
        set(name: string, value: string, options: any) {
          // compatível com as duas assinaturas (objeto vs parâmetros)
          try {
            (cookieStore as any).set(name, value, options);
          } catch {
            (cookieStore as any).set({ name, value, ...options });
          }
        },
        remove(name: string, options: any) {
          try {
            (cookieStore as any).delete(name);
          } catch {
            try {
              (cookieStore as any).set(name, "", { ...options, maxAge: 0 });
            } catch {
              (cookieStore as any).set({ name, value: "", ...options, maxAge: 0 });
            }
          }
        },
      },
    }
  );
}
