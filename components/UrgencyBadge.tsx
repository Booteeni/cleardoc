// Results UI component: shows the document urgency as a prominent colored pill.

export type UrgencyLevel = "urgent" | "soon" | "no-action-needed";

const STYLES: Record<
  UrgencyLevel,
  { className: string; label: string; ariaLabel: string }
> = {
  urgent: {
    className: "bg-rose-600 text-white",
    label: "⚠️ Action Required",
    ariaLabel: "Urgency: action required"
  },
  soon: {
    className: "bg-amber-500 text-white",
    label: "📅 Worth Doing Soon",
    ariaLabel: "Urgency: worth doing soon"
  },
  "no-action-needed": {
    className: "bg-emerald-600 text-white",
    label: "✅ No Action Needed",
    ariaLabel: "Urgency: no action needed"
  }
};

export function UrgencyBadge({ urgency }: { urgency: UrgencyLevel }) {
  const style = STYLES[urgency];

  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold shadow-sm",
        style.className
      ].join(" ")}
      aria-label={style.ariaLabel}
    >
      {style.label}
    </span>
  );
}

