// Signup page: handles Supabase email/password account creation.

"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#1a1f36]/50 focus:ring-2 focus:ring-[#1a1f36]/10";

export default function SignupPage() {
  const router = useRouter();
  const supabase = React.useMemo(() => createClient(), []);

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
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
        // Ignore session fetch errors.
      });

    return () => {
      isMounted = false;
    };
  }, [router, supabase.auth]);

  async function handleCreateAccount() {
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError("Passwords don&apos;t match. Please re-enter them.");
      return;
    }

    setLoading(true);
    try {
      const { error: authError } = await supabase.auth.signUp({
        email,
        password
      });

      if (authError) {
        setError("Couldn't create your account. Please check your details and try again.");
        return;
      }

      setSuccess("Check your email to confirm your account");
    } catch {
      setError("Something went wrong while creating your account. Please try again.");
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
            <h1 className="text-xl font-bold text-slate-900">Create your account</h1>

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
                  autoComplete="new-password"
                />
              </div>

              <div>
                <input
                  className={inputClass}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.currentTarget.value)}
                  type="password"
                  placeholder="Confirm password"
                  autoComplete="new-password"
                />
              </div>

              <button
                type="button"
                onClick={handleCreateAccount}
                disabled={loading}
                className="w-full rounded-xl bg-[#1a1f36] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#14192e] disabled:opacity-60"
              >
                Create account
              </button>

              {error ? (
                <p className="text-sm text-rose-600" role="alert">
                  {error}
                </p>
              ) : null}

              {success ? (
                <p className="text-sm text-emerald-700" role="status">
                  {success}
                </p>
              ) : null}

              <p className="mt-2 text-center text-sm text-slate-600">
                Already have an account?{" "}
                <Link className="font-semibold text-[#1a1f36] hover:underline" href="/login">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

