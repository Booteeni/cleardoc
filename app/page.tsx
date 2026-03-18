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
    <main className="min-h-dvh bg-gradient-to-b from-[#F5F9FF] via-white to-[#F7FAFF] px-6 py-12">
      <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col items-center justify-center">
        <section className="w-full rounded-2xl bg-white/90 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.35)] ring-1 ring-slate-200/60 backdrop-blur">
          {state === "loading" ? (
            <div className="px-8 py-16 text-center sm:px-10">
              <div className="mx-auto flex w-full max-w-md flex-col items-center">
                <div
                  className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-[#4A90D9]"
                  aria-hidden="true"
                />
                <p className="mt-6 text-lg font-semibold text-slate-900">
                  Reading your document...
                </p>
                <p className="mt-2 text-sm text-slate-500">This usually takes 10–15 seconds</p>
              </div>
            </div>
          ) : state === "error" ? (
            <div className="px-8 py-12 text-center sm:px-10">
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
                  className="inline-flex items-center justify-center rounded-2xl bg-[#4A90D9] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#3f7fc0] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4A90D9] focus-visible:ring-offset-2"
                >
                  Try again
                </button>
              </div>
            </div>
          ) : (
            <>
              <header className="px-8 pb-6 pt-8 text-center sm:px-10">
                <p className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                  <span className="mr-2" aria-hidden="true">
                    📄
                  </span>
                  ClearDoc
                </p>
                <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-slate-500">
                  Upload any confusing document. We&apos;ll tell you exactly what it means and what
                  to do.
                </p>
              </header>

              <div className="px-8 sm:px-10">
                <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200/80 to-transparent" />
              </div>

              <div className="px-8 pb-8 pt-8 sm:px-10 sm:pb-10">
                <div className="mb-6 flex items-end justify-between gap-3 border-b border-slate-200/70">
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setTab("file")}
                      className={[
                        "rounded-t-xl px-3 py-2 text-sm font-semibold transition",
                        tab === "file"
                          ? "bg-white text-slate-900 border-b-2 border-[#4A90D9]"
                          : "text-slate-500 hover:text-slate-700"
                      ].join(" ")}
                    >
                      📎 Upload a file
                    </button>
                    <button
                      type="button"
                      onClick={() => setTab("text")}
                      className={[
                        "rounded-t-xl px-3 py-2 text-sm font-semibold transition",
                        tab === "text"
                          ? "bg-white text-slate-900 border-b-2 border-[#4A90D9]"
                          : "text-slate-500 hover:text-slate-700"
                      ].join(" ")}
                    >
                      ✏️ Paste text
                    </button>
                  </div>
                </div>

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
                      className="min-h-[200px] w-full resize-y rounded-2xl border border-slate-200/70 bg-white px-4 py-4 text-sm leading-relaxed text-slate-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] outline-none transition placeholder:text-slate-400 focus:border-[#4A90D9]/60 focus:ring-2 focus:ring-[#4A90D9]/20"
                    />
                    <div className="mt-2 flex justify-end">
                      <p className="text-xs text-slate-500">{text.length} characters</p>
                    </div>
                  </div>
                )}

                <div className="mt-8 flex justify-center">
                  <button
                    type="button"
                    disabled={!canSubmit}
                    onClick={handleSubmit}
                    className={[
                      "inline-flex w-full max-w-md items-center justify-center gap-2 rounded-2xl px-7 py-4 text-base font-semibold transition",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4A90D9] focus-visible:ring-offset-2",
                      canSubmit
                        ? "bg-[#4A90D9] text-white shadow-sm hover:bg-[#3f7fc0] active:bg-[#356fa7]"
                        : "cursor-not-allowed bg-slate-200 text-slate-500"
                    ].join(" ")}
                  >
                    Explain this document <span aria-hidden="true">→</span>
                  </button>
                </div>

                <p className="mt-7 text-center text-sm text-slate-500">
                  <span className="mr-1" aria-hidden="true">
                    🔒
                  </span>
                  Your document is never stored or shared
                </p>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}

