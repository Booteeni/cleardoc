// Login page: handles Supabase email/password and Google OAuth sign-in.

"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#1a1f36]/50 focus:ring-2 focus:ring-[#1a1f36]/10";

export default function LoginPage() {
  const router = useRouter();
  const supabase = React.useMemo(() => createClient(), []);

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    let isMounted = true;
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (!isMounted) return;
        if (session) router.replace("/dashboard");
      })
      .catch(() => {
        // If session fetch fails, we stay on login page.
      });

    return () => {
      isMounted = false;
    };
  }, [router, supabase.auth]);

  async function handleEmailPasswordSignIn() {
    setError(null);
    setLoading(true);
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        setError("Couldn't sign you in. Please check your email and password.");
        return;
      }

      router.replace("/dashboard");
    } catch {
      setError("Something went wrong while signing in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setError(null);
    setLoading(true);
    try {
      const redirectTo = `${window.location.origin}/dashboard`;
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo }
      });

      if (authError) {
        setError("Couldn't start Google sign-in. Please try again.");
      }
    } catch {
      setError("Something went wrong with Google sign-in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen w-full bg-white">
      <section className="w-full bg-[#1a1f36] py-14 text-white">
        <div className="mx-auto w-full max-w-5xl px-6">
          <p className="text-sm font-semibold">
            ClearDoc <span aria-hidden="true">📄</span>
          </p>
          <p className="mt-2 text-sm text-slate-300">
            Understanding documents made simple
          </p>
        </div>
      </section>

      <section className="w-full bg-white">
        <div className="mx-auto flex w-full max-w-[400px] flex-col px-6 py-10">
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-8 shadow-sm">
            <h1 className="text-xl font-bold text-slate-900">Sign in to ClearDoc</h1>

            <div className="mt-6 space-y-4">
              <div>
                <input
                  className={inputClass}
                  value={email}
                  onChange={(e) => setEmail(e.currentTarget.value)}
                  type="email"
                  placeholder="Email"
                  autoComplete="email"
                />
              </div>

              <div>
                <input
                  className={inputClass}
                  value={password}
                  onChange={(e) => setPassword(e.currentTarget.value)}
                  type="password"
                  placeholder="Password"
                  autoComplete="current-password"
                />
              </div>

              <button
                type="button"
                onClick={handleEmailPasswordSignIn}
                disabled={loading}
                className="w-full rounded-xl bg-[#1a1f36] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#14192e] disabled:opacity-60"
              >
                Sign in
              </button>

              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-200" />
                <p className="text-xs font-semibold text-slate-500">or</p>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 disabled:opacity-60"
              >
                <span className="inline-flex items-center justify-center gap-2">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill="#FFC107"
                      d="M43.611 20.083H42V20H24v8h11.303C33.065 32.657 28.419 35 24 35c-5.523 0-10-4.477-10-10s4.477-10 10-10c2.49 0 4.757.912 6.522 2.417l5.657-5.657C33.146 6.053 28.806 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917Z"
                    />
                    <path
                      fill="#FF3D00"
                      d="M6.306 14.691 12.293 20.678C13.87 16.309 17.997 13 22.64 13c1.9 0 3.638.557 5.036 1.48l5.657-5.657C30.463 6.53 27.389 5 24 5c-6.815 0-12.517 4.1-15.694 9.691Z"
                      opacity=".9"
                    />
                    <path
                      fill="#4CAF50"
                      d="M24 44c4.8 0 9.15-2.05 12.2-5.33l-5.66-5.66C29.16 35.9 26.68 37 24 37c-4.42 0-9.06-2.34-11.3-7.01l-5.97 5.97C9.485 39.97 16.8 44 24 44Z"
                      opacity=".9"
                    />
                    <path
                      fill="#1976D2"
                      d="M43.611 20.083H42V20H24v8h11.303c-.99 2.2-2.68 3.93-4.72 5.09l5.66 5.66C39.98 35.56 44 30.3 44 24c0-1.34-.13-2.65-.389-3.917Z"
                      opacity=".9"
                    />
                  </svg>
                  Continue with Google
                </span>
              </button>

              {error ? (
                <p className="text-sm text-rose-600" role="alert">
                  {error}
                </p>
              ) : null}
            </div>

            <p className="mt-6 text-center text-sm text-slate-600">
              Don&apos;t have an account?{" "}
              <Link className="font-semibold text-[#1a1f36] hover:underline" href="/signup">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

