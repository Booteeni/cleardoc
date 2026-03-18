// Results UI component: checklist of next actions with numbered blue markers and strike-through when completed.

"use client";

import * as React from "react";

export function ActionList({ actions }: { actions: string[] }) {
  const [done, setDone] = React.useState<boolean[]>(
    () => new Array(actions.length).fill(false)
  );

  React.useEffect(() => {
    setDone(new Array(actions.length).fill(false));
  }, [actions.length]);

  return (
    <section className="mt-8">
      <h2 className="text-base font-bold text-slate-900">What to do next</h2>

      <ul className="mt-4 space-y-3">
        {actions.map((action, idx) => {
          const checked = done[idx] ?? false;
          return (
            <li
              key={`${idx}-${action}`}
              className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200/70 bg-white px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]"
            >
              <div className="flex min-w-0 items-start gap-3">
                <span
                  className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#4A90D9] text-sm font-semibold text-white"
                  aria-hidden="true"
                >
                  {idx + 1}
                </span>

                <p
                  className={[
                    "min-w-0 text-sm leading-relaxed text-slate-700 sm:text-[15px]",
                    checked ? "text-slate-400 line-through" : ""
                  ].join(" ")}
                >
                  {action}
                </p>
              </div>

              <label className="inline-flex items-center gap-2">
                <span className="sr-only">Mark action {idx + 1} complete</span>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => {
                    const next = done.slice();
                    next[idx] = e.currentTarget.checked;
                    setDone(next);
                  }}
                  className="mt-0.5 h-5 w-5 rounded border-slate-300 text-[#4A90D9] focus:ring-[#4A90D9]"
                />
              </label>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

