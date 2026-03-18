// Dashboard page: shows user info, credits card, and the upload tool; requires authentication.

"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { UploadZone } from "@/components/UploadZone";

type ScreenState = "idle" | "loading" | "error";
type InputTab = "file" | "text";

const STORAGE_KEY = "cleardoc_result";
const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;

export default function DashboardPage() {
  const router = useRouter();
  const supabase = React.useMemo(() => createClient(), []);

  const [sessionEmail, setSessionEmail] = React.useState<string | null>(null);
  const [authLoading, setAuthLoading] = React.useState(true);

  const [file, setFile] = React.useState<File | null>(null);
  const [tab, setTab] = React.useState<InputTab>("file");
  const [text, setText] = React.useState("");
  const [state, setState] = React.useState<ScreenState>("idle");

  const canSubmit =
    tab === "file"
      ? Boolean(file && file.size <= MAX_FILE_SIZE_BYTES)
      : text.trim().length >= 50;

  async function handleSubmit() {
    if (tab === "file" && (!file || file.size > MAX_FILE_SIZE_BYTES)) return;
    if (tab === "text" && text.trim().length < 50) return;

    setState("loading");

    try {
      const formData = new FormData();
      if (tab === "file") {
        formData.append("file", file as File);
      } else {
        formData.append("text", text);
      }

      const res = await fetch("/api/explain", {
        method: "POST",
        body: formData
      });

      if (!res.ok) throw new Error("api_error");

      const result = (await res.json()) as unknown;
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
      router.push("/results");
    } catch {
      setState("error");
    }
  }

  function reset() {
    setFile(null);
    setText("");
    setTab("file");
    setState("idle");
  }

  React.useEffect(() => {
    let mounted = true;

    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (!mounted) return;
        setSessionEmail(session?.user?.email ?? null);
        if (!session) router.replace("/login");
        setAuthLoading(false);
      })
      .catch(() => {
        if (!mounted) return;
        setAuthLoading(false);
        router.replace("/login");
      });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) return;
        setSessionEmail(session?.user?.email ?? null);
        if (!session) router.replace("/login");
      }
    );

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [router, supabase.auth]);

  React.useEffect(() => {
    if (tab === "file") return;
    setFile(null);
  }, [tab]);

  // Placeholder free-tier credits (no DB integration yet).
  const creditsUsed = 3;
  const creditsMax = 10;
  const creditsRemaining = creditsMax - creditsUsed;

  if (authLoading) {
    return (
      <main className="min-h-screen w-full bg-white">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <p className="text-sm font-semibold text-slate-700">Loading…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full bg-[#f8f9fb]">
      <div className="w-full bg-[#1a1f36]">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="text-sm font-semibold text-white transition hover:text-slate-100"
          >
            ClearDoc <span aria-hidden="true">📄</span>
          </Link>

          <div className="flex items-center gap-4">
            <p className="text-sm text-slate-200">{sessionEmail ?? ""}</p>
            <button
              type="button"
              onClick={async () => {
                await supabase.auth.signOut();
                router.replace("/login");
              }}
              className="rounded-md bg-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>

      <section className="mx-auto w-full max-w-5xl px-6 py-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <div className="w-full flex-1">
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-sm font-semibold text-slate-700">Your credits</h2>
              <p className="mt-4 text-4xl font-bold text-slate-900">
                {creditsRemaining}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                out of {creditsMax} credits this month
              </p>

              <div className="mt-5">
                <div className="h-2 w-full rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-[#1a1f36]"
                    style={{ width: `${(creditsUsed / creditsMax) * 100}%` }}
                    aria-hidden="true"
                  />
                </div>
                <div className="mt-2 flex justify-between text-xs text-slate-500">
                  <span>{creditsUsed} used</span>
                  <span>{creditsRemaining} remaining</span>
                </div>
              </div>

              <button
                type="button"
                className="mt-6 w-full rounded-xl border border-[#1a1f36] bg-white py-3 text-sm font-semibold text-[#1a1f36] transition hover:bg-slate-50"
              >
                Upgrade to Pro
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6">
          {state === "loading" ? (
            <div className="rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-200">
              <div className="mx-auto flex w-full max-w-md flex-col items-center">
                <div
                  className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-[#1a1f36]"
                  aria-hidden="true"
                />
                <p className="mt-6 text-lg font-semibold text-slate-900">
                  Reading your document...
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Large documents can take up to 30 seconds
                </p>
              </div>
            </div>
          ) : state === "error" ? (
            <div className="rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-200">
              <p className="text-lg font-semibold text-slate-900">
                We couldn&apos;t read that document.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                Please try a clearer photo or a different file.
              </p>

              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={reset}
                  className="inline-flex items-center justify-center rounded-lg bg-[#1a1f36] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#14192e] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1a1f36] focus-visible:ring-offset-2"
                >
                  Try again
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-white p-7 shadow-sm ring-1 ring-slate-200 sm:p-9">
              <div className="mb-6">
                <p className="text-sm font-semibold text-slate-900">
                  ClearDoc <span aria-hidden="true">📄</span>
                </p>
              </div>

              <div className="flex gap-6 border-b border-slate-200">
                <button
                  type="button"
                  onClick={() => setTab("file")}
                  className={[
                    "pb-3 text-sm font-semibold transition",
                    tab === "file"
                      ? "text-slate-900 border-b-2 border-[#1a1f36]"
                      : "text-slate-500 hover:text-slate-700"
                  ].join(" ")}
                >
                  📎 Upload a file
                </button>
                <button
                  type="button"
                  onClick={() => setTab("text")}
                  className={[
                    "pb-3 text-sm font-semibold transition",
                    tab === "text"
                      ? "text-slate-900 border-b-2 border-[#1a1f36]"
                      : "text-slate-500 hover:text-slate-700"
                  ].join(" ")}
                >
                  ✏️ Paste text
                </button>
              </div>

              <div className="mt-7">
                {tab === "file" ? (
                  <UploadZone
                    file={file}
                    onFileSelected={setFile}
                    disabled={false}
                    accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
                  />
                ) : (
                  <div className="w-full">
                    <textarea
                      value={text}
                      onChange={(e) => setText(e.currentTarget.value)}
                      placeholder="Paste the text from any document, email, letter or website here..."
                      className="min-h-[200px] w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm leading-relaxed text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#1a1f36]/50 focus:ring-2 focus:ring-[#1a1f36]/10"
                    />
                    <div className="mt-2 flex justify-end">
                      <p className="text-xs text-slate-500">{text.length} characters</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8">
                <button
                  type="button"
                  disabled={!canSubmit}
                  onClick={handleSubmit}
                  className={[
                    "inline-flex w-full items-center justify-center gap-2 rounded-lg px-6 py-4 text-base font-semibold transition",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1a1f36] focus-visible:ring-offset-2",
                    canSubmit
                      ? "bg-[#1a1f36] text-white hover:bg-[#14192e] hover:shadow-[0_0_0_4px_rgba(26,31,54,0.10),0_18px_45px_-30px_rgba(26,31,54,0.65)]"
                      : "cursor-not-allowed bg-slate-200 text-slate-500"
                  ].join(" ")}
                >
                  Explain this document <span aria-hidden="true">→</span>
                </button>
              </div>

              <p className="mt-6 text-center text-sm text-slate-500">
                <span className="mr-1" aria-hidden="true">
                  🔒
                </span>
                Your document is never stored or shared
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

