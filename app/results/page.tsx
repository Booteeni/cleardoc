// Results page: reads analysis output from localStorage and renders a premium, reassuring results view.

"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ActionList } from "@/components/ActionList";
import { ResultCard, type ResultData } from "@/components/ResultCard";
import { UrgencyBadge, type UrgencyLevel } from "@/components/UrgencyBadge";

const STORAGE_KEY = "cleardoc_result";

function isValidResultData(value: unknown): value is ResultData {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;

  if (typeof v.document_type !== "string") return false;
  if (typeof v.summary !== "string") return false;
  if (!Array.isArray(v.actions) || !v.actions.every((a) => typeof a === "string")) return false;
  if (
    !Array.isArray(v.key_numbers) ||
    !v.key_numbers.every((k) => typeof k === "string")
  ) {
    return false;
  }
  if (
    v.urgency !== "urgent" &&
    v.urgency !== "soon" &&
    v.urgency !== "no-action-needed"
  ) {
    return false;
  }
  if (!(typeof v.deadline === "string" || v.deadline === null)) return false;

  return true;
}

export default function ResultsPage() {
  const router = useRouter();
  const [data, setData] = React.useState<ResultData | null>(null);

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        router.replace("/");
        return;
      }

      const parsed: unknown = JSON.parse(raw);
      if (!isValidResultData(parsed)) {
        router.replace("/");
        return;
      }

      setData(parsed);
    } catch {
      router.replace("/");
    }
  }, [router]);

  if (!data) return null;

  return (
    <main className="h-dvh w-full bg-gradient-to-b from-[#F5F9FF] via-white to-[#F7FAFF]">
      <div className="mx-auto h-dvh w-full px-4 pb-6 pt-16 sm:px-6">
        <div className="fixed left-0 top-0 w-full">
          <div className="mx-auto flex w-full max-w-[800px] items-center px-4 py-4 sm:px-6">
            <Link
              href="/"
              className="text-sm font-semibold text-slate-800 transition hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4A90D9] focus-visible:ring-offset-2"
            >
              ClearDoc <span aria-hidden="true">📄</span>
            </Link>
          </div>
        </div>

        <section className="mx-auto flex h-full w-full max-w-[800px] flex-col overflow-hidden rounded-2xl bg-white/90 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.35)] ring-1 ring-slate-200/60 backdrop-blur">
          <div className="flex-1 overflow-y-auto px-6 pb-10 pt-8 sm:px-10">
            <div className="flex justify-center">
              <UrgencyBadge urgency={data.urgency as UrgencyLevel} />
            </div>

            <div className="mt-7">
              <ResultCard
                documentType={data.document_type}
                summary={data.summary}
                deadline={data.deadline}
              />
            </div>

            {data.key_numbers.length > 0 ? (
              <section className="mt-8">
                <h2 className="text-base font-bold text-slate-900">Key numbers at a glance</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {data.key_numbers.map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center rounded-full bg-[#4A90D9]/10 px-3 py-1.5 text-sm font-medium text-[#1F4F7A] ring-1 ring-inset ring-[#4A90D9]/20"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </section>
            ) : null}

            <ActionList actions={data.actions} />

            <div className="mt-10 flex justify-center">
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4A90D9] focus-visible:ring-offset-2"
              >
                ← Explain another document
              </Link>
            </div>

            <p className="mt-7 text-center text-sm text-slate-500">
              <span className="mr-1" aria-hidden="true">
                🔒
              </span>
              Your document is never stored or shared
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

