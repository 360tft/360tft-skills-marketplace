"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <span className="text-sm text-[var(--muted)] px-3 py-1.5">...</span>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/dashboard"
          className="text-xs font-medium px-3 py-1.5 rounded-lg bg-[var(--accent)] text-black hover:bg-[var(--accent-hover)] transition-colors"
        >
          Dashboard
        </Link>
        <button
          onClick={async () => {
            const supabase = createClient();
            await supabase.auth.signOut();
            window.location.href = "/";
          }}
          className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <Link
      href="/auth/login"
      className="text-xs font-medium px-3 py-1.5 rounded-lg border border-[var(--border)] text-[var(--foreground)] hover:bg-white/5 transition-colors"
    >
      Sign in
    </Link>
  );
}
