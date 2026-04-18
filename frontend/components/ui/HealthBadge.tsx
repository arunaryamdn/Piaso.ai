type HealthState = "green" | "amber" | "red" | "grey";

const colors: Record<HealthState, { bg: string; text: string }> = {
  green: { bg: "var(--green-50)", text: "var(--green-600)" },
  amber: { bg: "var(--amber-50)", text: "var(--amber-600)" },
  red:   { bg: "var(--red-50)",   text: "var(--red-600)"   },
  grey:  { bg: "var(--grey-50)",  text: "var(--grey-600)"  },
};

export default function HealthBadge({ state, label }: { state: HealthState; label: string }) {
  const c = colors[state] ?? colors.grey;
  return (
    <span
      className="text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
      style={{ background: c.bg, color: c.text }}
    >
      ● {label}
    </span>
  );
}
