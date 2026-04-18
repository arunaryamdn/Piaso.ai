interface FlipCardProps {
  value: string;
  label: string;
  valueColor?: string;
}

export default function FlipCard({ value, label, valueColor }: FlipCardProps) {
  return (
    <div
      className="flex-1 rounded-xl p-3 flex flex-col items-center gap-1 relative overflow-hidden"
      style={{ background: "var(--card-bg)", border: "1px solid var(--border)" }}
    >
      <span className="tabular font-semibold text-base" style={{ color: valueColor ?? "var(--ink-primary)" }}>
        {value}
      </span>
      {/* Split-flap visual divider */}
      <div className="absolute left-0 right-0" style={{ top: "50%", height: "1px", background: "rgba(0,0,0,0.08)" }} />
      <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: "var(--ink-muted)" }}>
        {label}
      </span>
    </div>
  );
}
