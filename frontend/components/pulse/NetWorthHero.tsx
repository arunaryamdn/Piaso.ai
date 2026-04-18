import HealthBadge from "@/components/ui/HealthBadge";

interface NetWorthHeroProps {
  netWorth: number;
  investGainPct: number;
  health: "green" | "amber" | "red" | "grey";
}

function formatInr(n: number): string {
  if (n >= 1_00_00_000) return `₹${(n / 1_00_00_000).toFixed(1)}Cr`;
  if (n >= 1_00_000) return `₹${(n / 1_00_000).toFixed(1)}L`;
  if (n >= 1_000) return `₹${(n / 1_000).toFixed(1)}K`;
  return `₹${n.toLocaleString("en-IN")}`;
}

export default function NetWorthHero({ netWorth, investGainPct, health }: NetWorthHeroProps) {
  const healthClass = `bg-health-${health}`;
  const sign = investGainPct >= 0 ? "+" : "";
  return (
    <div className={`rounded-2xl p-5 mt-4 ${healthClass}`}>
      <div className="flex items-start justify-between mb-1">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--ink-muted)" }}>
          Net Worth
        </span>
        <HealthBadge
          state={health}
          label={health === "green" ? "Healthy" : health === "amber" ? "Watch" : "At Risk"}
        />
      </div>
      <p className="font-display font-bold text-4xl tabular" style={{ color: "var(--ink-primary)" }}>
        {formatInr(netWorth)}
      </p>
      <p
        className="text-base font-display font-semibold tabular mt-1"
        style={{ color: investGainPct >= 0 ? "var(--gain)" : "var(--loss)" }}
      >
        {sign}{investGainPct.toFixed(1)}% portfolio returns
      </p>
    </div>
  );
}
