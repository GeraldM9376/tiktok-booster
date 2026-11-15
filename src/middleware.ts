// src/middleware.ts
import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  // Force no cache for all /earn routes
  if (request.nextUrl.pathname.startsWith("/earn")) {
    const response = await updateSession(request);
    response.headers.set("Cache-Control", "no-store, max-age=0");
    return response;
  }
  
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};