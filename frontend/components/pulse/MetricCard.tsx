import Link from "next/link";

interface MetricCardProps {
  title: string;
  value: string;
  subtext: string;
  health: "green" | "amber" | "red" | "grey";
  href: string;
}

const healthColors = {
  green: { bg: "var(--green-50)", border: "var(--green-100)", text: "var(--green-600)" },
  amber: { bg: "var(--amber-50)", border: "var(--amber-100)", text: "var(--amber-600)" },
  red:   { bg: "var(--red-50)",   border: "var(--red-100)",   text: "var(--red-600)"   },
  grey:  { bg: "var(--grey-50)",  border: "var(--grey-100)",  text: "var(--grey-600)"  },
};

export default function MetricCard({ title, value, subtext, health, href }: MetricCardProps) {
  const c = healthColors[health];
  return (
    <Link href={href} className="flex-1">
      <div
        className="rounded-xl p-4 h-full"
        style={{ background: c.bg, border: `1.5px solid ${c.border}` }}
      >
        <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--ink-muted)" }}>
          {title}
        </p>
        <p className="font-display font-bold text-lg tabular" style={{ color: "var(--ink-primary)" }}>{value}</p>
        <p className="text-xs mt-0.5 font-semibold" style={{ color: c.text }}>{subtext}</p>
      </div>
    </Link>
  );
}
