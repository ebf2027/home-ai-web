import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session if needed
  const { data: { user } } = await supabase.auth.getUser();

  const url = request.nextUrl.clone();
  const pathname = url.pathname;

  // STRICTLY IGNORE PUBLIC ROUTES
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/auth") ||
    pathname.includes(".")
  ) {
    return response;
  }

  // PROTECT ONLY SPECIFIC PRIVATE ROUTES
  // This is the safest way to avoid loops.
  // PROTECT ONLY SPECIFIC PRIVATE ROUTES
  // This is the safest way to avoid loops.
  const isPrivate =
    pathname.startsWith("/gallery") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/upgrade");

  /* 
  // TEMPORARY: Allow public access for testing
  if (isPrivate && !user) {
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  */

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (login page)
     * - auth (auth callbacks)
     * - api (API routes)
     */
    "/((?!_next/static|_next/image|favicon.ico|login|auth|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
