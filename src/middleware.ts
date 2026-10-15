import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export const PUBLIC_ROUTES = new Set(["/", "/login", "/register"]);
export const PUBLIC_PREFIXES = [
  "/auth/",
  "/_next/",
  "/favicon.ico",
  "/icon.svg",
  "/manifest.webmanifest",
  "/sw.js",
];

export function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_ROUTES.has(pathname)) return true;
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip auth check for public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Create Supabase client with cookie handling for session refresh
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If Supabase is not configured, fail closed in production, allow local preview in dev only if explicitly enabled
  if (!supabaseUrl || !supabaseAnonKey) {
    if (process.env.NODE_ENV === "production") {
      return new NextResponse("Server Configuration Error: Missing Authentication Provider", { status: 503 });
    }
    // Strictly block unauthenticated /api/* access even in dev when Supabase is missing (R-4)
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Authentication required. Backend service not configured." },
        { status: 503 }
      );
    }
    // Gate page route bypass behind explicit HUNTBOARD_DEV_PREVIEW=1
    if (process.env.HUNTBOARD_DEV_PREVIEW === "1") {
      return response;
    }
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options: Record<string, unknown> }>) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({
          request: { headers: request.headers },
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // Refresh session — this is critical for keeping auth state alive
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect unauthenticated users to login (or return 401 for API routes)
  if (!user) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based route protection
  const userRole = (user.app_metadata?.role as string) || (user.user_metadata?.role as string);

  if (pathname.startsWith("/admin")) {
    let role = userRole;
    if (!role) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      role = profile?.role;
    }

    if (role !== "admin") {
      const redirectResponse = NextResponse.redirect(new URL("/dashboard", request.url));
      response.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
      });
      return redirectResponse;
    }
  }

  if (pathname.startsWith("/recruiter")) {
    let role = userRole;
    if (!role) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      role = profile?.role;
    }

    if (role !== "recruiter" && role !== "admin") {
      const redirectResponse = NextResponse.redirect(new URL("/dashboard", request.url));
      response.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
      });
      return redirectResponse;
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next (Next.js internals and static chunks)
     * - favicon.ico (favicon file)
     * - static image/asset extensions
     */
    "/((?!_next|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js|woff|woff2)$).*)",
  ],
};
