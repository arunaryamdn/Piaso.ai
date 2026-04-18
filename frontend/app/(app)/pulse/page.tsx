import { auth } from "@/auth";
import { apiFetch } from "@/lib/api";
import NetWorthHero from "@/components/pulse/NetWorthHero";
import MetricCard from "@/components/pulse/MetricCard";

interface PulseData {
  net_worth: number;
  invest_gain_pct: number;
  invest_health: "green" | "amber" | "red" | "grey";
  spend_health: "green" | "amber" | "red" | "grey";
  spend_balance: number;
  runway_days: number;
  overall_health: "green" | "amber" | "red" | "grey";
}

function formatInr(n: number): string {
  if (n >= 1_00_000) return `₹${(n / 1_00_000).toFixed(1)}L`;
  if (n >= 1_000) return `₹${(n / 1_000).toFixed(0)}K`;
  return `₹${n.toLocaleString("en-IN")}`;
}

export default async function PulsePage() {
  const session = await auth();
  const token = (session as any)?.accessToken ?? "";

  let data: PulseData | null = null;
  try {
    data = await apiFetch<PulseData>("/api/pulse", token);
  } catch {
    // Show welcome state if pulse is unavailable
  }

  if (!data) {
    return (
      <div className="mt-8 text-center">
        <p className="font-display text-2xl font-bold" style={{ color: "var(--ink-primary)" }}>
          Welcome to Piaso.ai
        </p>
        <p className="text-sm mt-2" style={{ color: "var(--ink-muted)" }}>
          Add your portfolio and bank statement to see your financial pulse.
        </p>
      </div>
    );
  }

  return (
    <>
      <NetWorthHero
        netWorth={data.net_worth}
        investGainPct={data.invest_gain_pct}
        health={data.overall_health}
      />
      <div className="flex gap-3 mt-3">
        <MetricCard
          title="Investments"
          value={formatInr(data.net_worth)}
          subtext={`${data.invest_gain_pct >= 0 ? "+" : ""}${data.invest_gain_pct.toFixed(1)}% returns`}
          health={data.invest_health}
          href="/invest"
        />
        <MetricCard
          title="This Month"
          value={formatInr(data.spend_balance)}
          subtext={`${data.runway_days} days left`}
          health={data.spend_health}
          href="/spend"
        />
      </div>
    </>
  );
}
