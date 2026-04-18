import { auth } from "@/auth";
import { apiFetch } from "@/lib/api";
import PortfolioHero from "@/components/invest/PortfolioHero";
import HoldingsTable from "@/components/invest/HoldingsTable";
import Link from "next/link";

interface DashboardData {
  metrics: {
    total_value: number;
    invested_amount: number;
    total_gain_loss: number;
    total_gain_loss_pct: number;
    cagr: number;
  };
  holdings: Array<{
    symbol: string;
    qty: number;
    avg_price: number;
    current_price: number;
    current_value: number;
    gain_loss: number;
    gain_loss_pct: number;
  }>;
  portfolio_status: string;
}

export default async function InvestPage() {
  const session = await auth();
  const token = (session as any)?.accessToken ?? "";

  let data: DashboardData | null = null;
  let error: string | null = null;

  try {
    data = await apiFetch<DashboardData>("/api/dashboard/analytics", token);
  } catch (e: any) {
    error = e.message;
  }

  if (data?.portfolio_status === "not_found") {
    return (
      <div className="mt-8 text-center">
        <p className="font-display text-xl font-bold mb-2" style={{ color: "var(--ink-primary)" }}>
          No portfolio yet
        </p>
        <p className="text-sm mb-4" style={{ color: "var(--ink-muted)" }}>
          Upload your Zerodha Excel to get started.
        </p>
        <Link
          href="/invest/upload"
          className="inline-block px-5 py-3 rounded-xl text-sm font-semibold text-white"
          style={{ background: "var(--primary)" }}
        >
          Upload Portfolio
        </Link>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mt-8 p-4 rounded-xl" style={{ background: "var(--red-50)", color: "var(--red-600)" }}>
        <p className="font-semibold text-sm">Could not load portfolio</p>
        <p className="text-xs mt-1">{error ?? "Unknown error"}</p>
      </div>
    );
  }

  const m = data.metrics;
  const holdings = data.holdings.map((h) => ({
    symbol: h.symbol,
    qty: h.qty,
    avgPrice: h.avg_price,
    currentPrice: h.current_price,
    currentValue: h.current_value,
    gainLoss: h.gain_loss,
    gainLossPct: h.gain_loss_pct,
  }));

  return (
    <>
      <PortfolioHero
        totalValue={m.total_value}
        invested={m.invested_amount}
        totalGain={m.total_gain_loss}
        gainPct={m.total_gain_loss_pct}
        cagr={m.cagr}
      />
      <HoldingsTable holdings={holdings} />
    </>
  );
}
