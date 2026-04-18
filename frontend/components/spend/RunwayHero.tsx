import HealthBadge from "@/components/ui/HealthBadge";
import FlipCard from "@/components/ui/FlipCard";

interface RunwayHeroProps {
  health: "green" | "amber" | "red" | "grey";
  balance: number;
  runwayDays: number;
  pctSpent: number;
  daysElapsed: number;
  cycleDay: number;
}

export default function RunwayHero({ health, balance, runwayDays, pctSpent, daysElapsed, cycleDay }: RunwayHeroProps) {
  const healthClass = `bg-health-${health}`;
  const label = health === "green" ? "On Track" : health === "amber" ? "Watch" : "At Risk";

  return (
    <div className={`rounded-2xl p-5 mt-4 ${healthClass}`}>
      <div className="flex items-start justify-between mb-1">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--ink-muted)" }}>
          This Month
        </span>
        <HealthBadge state={health} label={label} />
      </div>
      <p className="font-display font-bold text-3xl tabular" style={{ color: "var(--ink-primary)" }}>
        ₹{balance.toLocaleString("en-IN")} left
      </p>
      <p className="text-sm mt-1" style={{ color: "var(--ink-secondary)" }}>
        {runwayDays} days of comfortable spending
      </p>
      <div className="h-px my-3" style={{ background: "rgba(0,0,0,0.08)" }} />
      <div className="h-2 rounded-full mb-3" style={{ background: "var(--grey-100)" }}>
        <div
          className="h-2 rounded-full transition-all"
          style={{
            width: `${Math.min(pctSpent, 100)}%`,
            background: health === "green" ? "var(--green-500)" : health === "amber" ? "var(--amber-500)" : "var(--red-500)",
          }}
        />
      </div>
      <div className="flex gap-2">
        <FlipCard value={`Day ${daysElapsed}`} label="Cycle Day" />
        <FlipCard value={`${pctSpent.toFixed(0)}%`} label="Spent" />
      </div>
    </div>
  );
}
