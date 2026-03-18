// Home page: calming upload screen that collects a document (no explain logic yet).

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { UploadZone } from "@/components/UploadZone";

type ScreenState = "idle" | "loading" | "error";
type InputTab = "file" | "text";

export default function HomePage() {
  const router = useRouter();
  const [file, setFile] = React.useState<File | null>(null);
  const [tab, setTab] = React.useState<InputTab>("file");
  const [text, setText] = React.useState("");
  const [state, setState] = React.useState<ScreenState>("idle");
  const canSubmit = tab === "file" ? Boolean(file) : text.trim().length >= 50;

  async function handleSubmit() {
    if (tab === "file" && !file) return;
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
      window.localStorage.setItem("cleardoc_result", JSON.stringify(result));
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
    if (tab === "file") return;
    setFile(null);
  }, [tab]);

  return (
    <main className="min-h-screen w-full bg-white">
      <div className="min-h-screen w-full lg:flex">
        <aside className="relative w-full bg-[#1a1f36] px-8 py-10 text-white lg:w-[40%] lg:px-12 lg:py-14">
          <div className="mx-auto flex h-full max-w-xl flex-col">
            <div className="flex-1">
              <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                Understand any document. Instantly.
              </h1>

              <p className="mt-5 max-w-lg text-base leading-relaxed text-slate-300 sm:text-lg">
                Paste or upload any confusing letter, contract, or document. We&apos;ll explain exactly
                what it means and what you need to do — in plain English.
              </p>

              <ul className="mt-8 space-y-3 text-sm text-slate-200 sm:text-base">
                {[
                  "Plain English explanations",
                  "Key actions highlighted",
                  "Your document is never stored"
                ].map((t) => (
                  <li key={t} className="flex items-start gap-3">
                    <span
                      className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-white"
                      aria-hidden="true"
                    >
                      ✓
                    </span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="mt-10 text-sm leading-relaxed text-slate-400">
              Trusted by people dealing with HMRC letters, tenancy agreements, insurance policies and
              more
            </p>
          </div>
        </aside>

        <section className="flex w-full items-center justify-center bg-white px-6 py-10 lg:w-[60%] lg:px-12">
          <div className="w-full max-w-xl">
            {state === "loading" ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                <div className="mx-auto flex w-full max-w-md flex-col items-center">
                  <div
                    className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-[#1a1f36]"
                    aria-hidden="true"
                  />
                  <p className="mt-6 text-lg font-semibold text-slate-900">
                    Reading your document...
                  </p>
                  <p className="mt-2 text-sm text-slate-500">This usually takes 10–15 seconds</p>
                </div>
              </div>
            ) : state === "error" ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
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
              <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
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
                      "inline-flex w-full items-center justify-center gap-2 rounded-lg px-6 py-4 text-[15px] font-semibold transition",
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
      </div>
    </main>
  );
}

