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
    <main className="min-h-screen w-full">
      <section className="w-full bg-[#1a1f36] py-16 text-white">
        <div className="mx-auto w-full max-w-5xl px-6">
          <h1 className="text-center text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            Understand any document. Instantly.
          </h1>

          <p className="mx-auto mt-5 max-w-3xl text-center text-base leading-relaxed text-slate-300 sm:text-lg">
            Paste or upload any confusing letter, contract, or document. We&apos;ll explain exactly
            what it means and what you need to do — in plain English.
          </p>

          <ul className="mx-auto mt-10 flex max-w-4xl flex-col gap-4 text-sm text-slate-200 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:text-base">
            {[
              "Plain English explanations",
              "Key actions highlighted",
              "Your document is never stored"
            ].map((t) => (
              <li key={t} className="flex items-center gap-3">
                <span
                  className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-white"
                  aria-hidden="true"
                >
                  ✓
                </span>
                <span className="whitespace-nowrap">{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="w-full bg-white pt-6 pb-10">
        <div className="mx-auto w-full max-w-[700px] px-6">
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
                <p className="mt-2 text-sm text-slate-500">This usually takes 10–15 seconds</p>
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

      {/* SECTION 2 - How it works */}
      <section className="w-full bg-white py-16">
        <div className="mx-auto w-full max-w-5xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              How it works
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
              Three steps to understanding any document
            </p>
          </div>

          <div className="mt-12 hidden items-center gap-10 lg:flex">
            {/* Step 1 */}
            <div className="flex flex-1 flex-col items-center text-center">
              <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#1a1f36] text-white">
                <span className="text-lg font-bold">1</span>
              </div>
              <div className="text-3xl" aria-hidden="true">
                📎
              </div>
              <h3 className="mt-3 text-lg font-semibold text-slate-900">
                Upload or paste
              </h3>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-600">
                Upload a PDF, photo, or paste text from any document, letter or website
                you&apos;ve been sent.
              </p>
            </div>

            <div className="text-slate-300" aria-hidden="true">
              <span className="text-3xl">→</span>
            </div>

            {/* Step 2 */}
            <div className="flex flex-1 flex-col items-center text-center">
              <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#1a1f36] text-white">
                <span className="text-lg font-bold">2</span>
              </div>
              <div className="text-3xl" aria-hidden="true">
                🤖
              </div>
              <h3 className="mt-3 text-lg font-semibold text-slate-900">
                AI reads it instantly
              </h3>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-600">
                Our AI analyses the document and breaks it down into plain English — no
                jargon, no confusion.
              </p>
            </div>

            <div className="text-slate-300" aria-hidden="true">
              <span className="text-3xl">→</span>
            </div>

            {/* Step 3 */}
            <div className="flex flex-1 flex-col items-center text-center">
              <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#1a1f36] text-white">
                <span className="text-lg font-bold">3</span>
              </div>
              <div className="text-3xl" aria-hidden="true">
                ✅
              </div>
              <h3 className="mt-3 text-lg font-semibold text-slate-900">
                Get your action plan
              </h3>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-600">
                See exactly what the document means and what you need to do next —
                in seconds.
              </p>
            </div>
          </div>

          {/* Mobile/tablet stacked steps */}
          <div className="mt-8 flex flex-col gap-8 lg:hidden">
            {[
              {
                n: "1",
                icon: "📎",
                title: "Upload or paste",
                text: "Upload a PDF, photo, or paste text from any document, letter or website",
                tail: "you&apos;ve been sent.",
              },
              {
                n: "2",
                icon: "🤖",
                title: "AI reads it instantly",
                text: "Our AI analyses the document and breaks it down into plain English — no",
                tail: "jargon, no confusion.",
              },
              {
                n: "3",
                icon: "✅",
                title: "Get your action plan",
                text: "See exactly what the document means and what you need to do next —",
                tail: "in seconds.",
              }
            ].map((s) => (
              <div key={s.n} className="flex flex-col items-center text-center">
                <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#1a1f36] text-white">
                  <span className="text-lg font-bold">{s.n}</span>
                </div>
                <div className="text-3xl" aria-hidden="true">
                  {s.icon}
                </div>
                <h3 className="mt-3 text-lg font-semibold text-slate-900">{s.title}</h3>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-600">
                  {s.text} {s.tail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3 - Use cases */}
      <section className="w-full bg-[#f8f9fb] py-16">
        <div className="mx-auto w-full max-w-6xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Works with any confusing document
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
              From official letters to legal contracts — we explain it all
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: "📋",
                title: "HMRC Letters",
                desc: "Tax codes, self assessment, payment demands — we&apos;ll tell you exactly what HMRC wants and by when"
              },
              {
                icon: "🏠",
                title: "Tenancy Agreements",
                desc: "Understand your rights, deposit rules, and what you&apos;re actually agreeing to before you sign"
              },
              {
                icon: "🚗",
                title: "Parking Fines",
                desc: "Find out if you have to pay, how to appeal, and what happens if you ignore it"
              },
              {
                icon: "🏥",
                title: "Medical Letters",
                desc: "GP referrals, test results, hospital letters — explained in plain English without the worry"
              },
              {
                icon: "📄",
                title: "Insurance Policies",
                desc: "Know exactly what you&apos;re covered for, what&apos;s excluded, and when your renewal is due"
              },
              {
                icon: "💼",
                title: "Employment Contracts",
                desc: "Understand your notice period, holiday allowance, and any clauses that could affect you"
              }
            ].map((c) => (
              <article
                key={c.title}
                className={[
                  "rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 transition",
                  "hover:-translate-y-0.5 hover:border-[#4A90D9]/40 hover:shadow-md hover:ring-[#4A90D9]/25"
                ].join(" ")}
              >
                <div className="text-2xl" aria-hidden="true">
                  {c.icon}
                </div>
                <h3 className="mt-3 text-lg font-semibold text-slate-900">{c.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{c.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4 - Pricing */}
      <section className="w-full bg-white py-16">
        <div className="mx-auto w-full max-w-6xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Simple, affordable pricing
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
              Try it free. Upgrade when you&apos;re ready.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* FREE */}
            <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
              <p className="text-2xl font-bold text-slate-900">Free</p>
              <p className="mt-2 text-4xl font-bold tracking-tight text-slate-900">
                £0 <span className="text-base font-semibold text-slate-600">/ month</span>
              </p>

              <ul className="mt-6 space-y-3 text-sm">
                {[
                  ["✓", "3 documents per month"],
                  ["✓", "Plain English explanations"],
                  ["✓", "Key action items"],
                  ["✗", "Unlimited documents", "text-slate-500"],
                  ["✗", "Priority processing", "text-slate-500"]
                ].map((f) => (
                  <li key={String(f[1])} className="flex items-start gap-3">
                    <span
                      className={[
                        "mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100",
                        f[0] === "✓" ? "text-emerald-600" : "text-slate-500"
                      ].join(" ")}
                      aria-hidden="true"
                    >
                      {f[0]}
                    </span>
                    <span className={f[2] ? String(f[2]) : "text-slate-700"}>
                      {String(f[1])}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                className="mt-7 w-full rounded-lg border border-slate-300 bg-white py-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1a1f36] focus-visible:ring-offset-2"
              >
                Get started free
              </button>
            </div>

            {/* PRO */}
            <div className="relative rounded-2xl bg-[#1a1f36] p-8 text-white shadow-[0_20px_70px_-40px_rgba(26,31,54,0.9)]">
              <div className="absolute -top-3 left-6">
                <span className="inline-flex items-center rounded-full bg-amber-400 px-3 py-1 text-xs font-semibold text-amber-950">
                  Most popular
                </span>
              </div>

              <p className="text-2xl font-bold text-white">Pro</p>
              <p className="mt-2 text-4xl font-bold tracking-tight text-white">
                £4.99 <span className="text-base font-semibold text-slate-200">/ month</span>
              </p>

              <ul className="mt-6 space-y-3 text-sm">
                {[
                  "Unlimited documents",
                  "Plain English explanations",
                  "Key action items",
                  "Priority processing",
                  "Email support"
                ].map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <span
                      className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-emerald-200"
                      aria-hidden="true"
                    >
                      ✓
                    </span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                className="mt-7 w-full rounded-lg bg-white py-4 text-sm font-semibold text-[#1a1f36] transition hover:bg-slate-100"
              >
                Get started
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5 - FAQ */}
      <section className="w-full bg-[#f8f9fb] py-16">
        <div className="mx-auto w-full max-w-4xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Frequently asked questions
            </h2>
          </div>

          <FaqAccordion />
        </div>
      </section>

      {/* SECTION 6 - Footer */}
      <footer className="w-full bg-[#1a1f36] py-10 text-white">
        <div className="mx-auto w-full max-w-6xl px-6">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="text-lg font-semibold">
                ClearDoc <span aria-hidden="true">📄</span>
              </div>
              <p className="mt-2 text-sm text-slate-300">
                Understanding documents made simple
              </p>
            </div>

            <div className="text-sm text-slate-200">
              <a className="hover:text-white" href="#">
                Privacy Policy
              </a>
              <span className="mx-2 text-slate-500" aria-hidden="true">
                |
              </span>
              <a className="hover:text-white" href="#">
                Terms of Service
              </a>
              <span className="mx-2 text-slate-500" aria-hidden="true">
                |
              </span>
              <a className="hover:text-white" href="#">
                Contact
              </a>
            </div>
          </div>

          <p className="mt-8 text-sm text-slate-300">
            © 2026 ClearDoc. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}

function FaqAccordion() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  const items = [
    {
      q: "Is my document safe?",
      a: "Yes. Your document is sent securely to our AI and is never stored, saved, or shared with anyone. We delete it immediately after processing."
    },
    {
      q: "What types of documents can I upload?",
      a: "You can upload PDFs, JPG, or PNG images of any document. You can also paste text directly from any website or document."
    },
    {
      q: "How accurate is the explanation?",
      a: "Our AI is very accurate at explaining what documents mean in plain English. However we always recommend seeking professional advice for important legal or financial decisions."
    },
    {
      q: "What is the free plan?",
      a: "The free plan lets you explain up to 3 documents per month. After that you can upgrade to Pro for unlimited documents at £4.99/month."
    },
    {
      q: "Can I cancel my subscription?",
      a: "Yes, you can cancel anytime. There are no contracts or hidden fees."
    },
    {
      q: "What if I don't understand the explanation?",
      a: "Our explanations are written to be understood by anyone. If you're still confused, contact our support team and we'll help."
    }
  ];

  return (
    <div className="mt-10">
      {items.map((item, idx) => {
        const expanded = openIndex === idx;

        return (
          <div
            key={item.q}
            className="mb-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            <button
              type="button"
              onClick={() => setOpenIndex(expanded ? null : idx)}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
              aria-expanded={expanded}
            >
              <span className="text-sm font-semibold text-slate-900 sm:text-base">
                {item.q}
              </span>

              <span
                className={[
                  "relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-700 transition",
                  expanded ? "bg-[#1a1f36] border-[#1a1f36] text-white" : ""
                ].join(" ")}
                aria-hidden="true"
              >
                <span
                  className={[
                    "relative block h-4 w-4 transition-transform",
                    expanded ? "rotate-45" : "rotate-0"
                  ].join(" ")}
                >
                  <span className="absolute left-1/2 top-1/2 h-[2px] w-4 -translate-x-1/2 -translate-y-1/2 bg-current" />
                  <span className="absolute left-1/2 top-1/2 h-4 w-[2px] -translate-x-1/2 -translate-y-1/2 bg-current" />
                </span>
              </span>
            </button>

            <div
              className={[
                "px-6 pb-5 text-sm leading-relaxed text-slate-600 transition-[max-height,opacity] duration-300",
                expanded ? "max-h-[280px] opacity-100" : "max-h-0 opacity-0"
              ].join(" ")}
            >
              {item.a}
            </div>
          </div>
        );
      })}
    </div>
  );
}

