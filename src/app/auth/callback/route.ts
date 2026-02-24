import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { APP_CONFIG } from "@/lib/config";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { sendWelcomeEmail, notifyNewSignup } from "@/lib/email";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const redirectTo = searchParams.get("redirectTo") || "/dashboard";

  if (!code) {
    return NextResponse.redirect(new URL("/auth/login", APP_CONFIG.url));
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.redirect(new URL("/auth/login", APP_CONFIG.url));
  }

  const response = NextResponse.redirect(new URL(redirectTo, APP_CONFIG.url));

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL("/auth/login", APP_CONFIG.url));
  }

  // Send welcome email for new users (check if profile was just created)
  if (data.user) {
    const db = getSupabaseAdmin();
    if (db) {
      const { data: profile } = await db
        .from("profiles")
        .select("created_at")
        .eq("id", data.user.id)
        .single();

      // If profile was created within the last 60 seconds, treat as new user
      if (profile) {
        const createdAt = new Date(profile.created_at).getTime();
        const now = Date.now();
        if (now - createdAt < 60_000) {
          const name =
            data.user.user_metadata?.display_name ||
            data.user.email?.split("@")[0] ||
            "there";
          sendWelcomeEmail(data.user.email!, name).catch(() => {});
          notifyNewSignup(data.user.email!).catch(() => {});
        }
      }
    }
  }

  return response;
}
