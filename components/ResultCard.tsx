// Results UI component: shows document type, optional deadline highlight, and the plain-English summary.

export type ResultData = {
  document_type: string;
  summary: string;
  actions: string[];
  urgency: "urgent" | "soon" | "no-action-needed";
  deadline: string | null;
  key_numbers: string[];
};

export function ResultCard({
  documentType,
  summary,
  deadline
}: {
  documentType: string;
  summary: string;
  deadline: string | null;
}) {
  return (
    <article>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {documentType}
      </p>

      {!deadline ? null : (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <span className="font-semibold">📅 Deadline:</span> {deadline}
        </div>
      )}

      <p className="mt-5 text-base leading-relaxed text-slate-700 sm:text-[17px]">
        {summary}
      </p>
    </article>
  );
}

