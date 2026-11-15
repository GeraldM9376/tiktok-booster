// src/lib/supabase/middleware.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refreshes the Supabase session on every request and enforces
 * authentication on protected route prefixes.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Protected prefixes — require any authenticated user
  const requiresAuth =
    pathname.startsWith("/earn/") && pathname !== "/earn/auth" ||
    pathname.startsWith("/creator/") && pathname !== "/creator/auth" ||
    pathname.startsWith("/admin/") && pathname !== "/admin/auth";

  if (requiresAuth && !user) {
    const loginUrl = new URL(
      pathname.startsWith("/admin")
        ? "/admin/auth"
        : pathname.startsWith("/creator")
          ? "/creator/auth"
          : "/earn/auth",
      request.url,
    );
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}