import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";

  // Redirect footballai.co and skills.360tft.com to aifootball.co
  if (
    host.includes("footballai.co") ||
    host.includes("skills.360tft.com")
  ) {
    const url = new URL(request.url);
    url.host = "aifootball.co";
    url.port = "";
    return NextResponse.redirect(url, 301);
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://aifootball.co";
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If Supabase isn't configured, skip auth checks
  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
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

  // Refresh session (important for keeping auth tokens fresh)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Protected routes — redirect to login if not authenticated
  if (
    (pathname.startsWith("/dashboard") ||
      pathname.startsWith("/developer") ||
      pathname.startsWith("/admin")) &&
    !user
  ) {
    const loginUrl = new URL("/auth/login", appUrl);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin routes — require admin role
  if (pathname.startsWith("/admin") && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (profile?.role !== "admin") {
      return NextResponse.redirect(new URL("/", appUrl));
    }
  }

  // Redirect authenticated users away from login page
  if (pathname.startsWith("/auth/login") && user) {
    return NextResponse.redirect(new URL("/dashboard", appUrl));
  }

  return response;
}

export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
};
