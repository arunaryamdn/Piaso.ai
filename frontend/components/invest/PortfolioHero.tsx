import FlipCard from "@/components/ui/FlipCard";
import HealthBadge from "@/components/ui/HealthBadge";

interface PortfolioHeroProps {
  totalValue: number;
  invested: number;
  totalGain: number;
  gainPct: number;
  cagr: number;
}

function formatInr(n: number): string {
  if (Math.abs(n) >= 10_00_000) return `₹${(n / 10_00_000).toFixed(1)}L`;
  if (Math.abs(n) >= 1_000) return `₹${(n / 1_000).toFixed(1)}K`;
  return `₹${n.toLocaleString("en-IN")}`;
}

export default function PortfolioHero({ totalValue, invested, totalGain, gainPct, cagr }: PortfolioHeroProps) {
  const healthClass = gainPct >= 10 ? "bg-health-green" : gainPct >= 0 ? "bg-health-grey" : "bg-health-red";
  const gainColor = totalGain >= 0 ? "var(--gain)" : "var(--loss)";
  const sign = totalGain >= 0 ? "+" : "";

  return (
    <div className={`rounded-2xl p-5 mt-4 ${healthClass}`}>
      <div className="flex items-start justify-between mb-1">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--ink-muted)" }}>
          Portfolio Value
        </span>
        <HealthBadge state={gainPct >= 0 ? "green" : "red"} label={gainPct >= 0 ? "Growing" : "Down"} />
      </div>
      <p className="font-display font-bold text-3xl tabular" style={{ color: "var(--ink-primary)" }}>
        {formatInr(totalValue)}
      </p>
      <p className="text-lg font-display font-semibold tabular mt-0.5" style={{ color: gainColor }}>
        {sign}{formatInr(totalGain)} ({sign}{gainPct.toFixed(1)}%)
      </p>
      <div className="h-px my-3" style={{ background: "rgba(0,0,0,0.08)" }} />
      <div className="flex gap-2">
        <FlipCard value={formatInr(invested)} label="Invested" />
        <FlipCard value={`${cagr.toFixed(1)}%`} label="CAGR" valueColor={cagr >= 0 ? "var(--gain)" : "var(--loss)"} />
      </div>
    </div>
  );
}
