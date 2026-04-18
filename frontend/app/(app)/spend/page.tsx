"use client";
import { useState, useEffect, useCallback } from "react";
import RunwayHero from "@/components/spend/RunwayHero";
import TransactionList from "@/components/spend/TransactionList";
import StatementUpload from "@/components/spend/StatementUpload";

interface Summary {
  health: "green" | "amber" | "red" | "grey";
  balance: number;
  runway_days: number;
  pct_spent: number;
  days_elapsed: number;
  salary_day: number;
}

interface Transaction {
  id: number;
  date: string;
  description: string;
  amount: number;
  transaction_type: string;
  confidence: string;
}

type Tab = "overview" | "transactions" | "upload";

export default function SpendPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [tab, setTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, t] = await Promise.all([
        fetch("/api/spend/summary").then((r) => r.json()),
        fetch("/api/spend/transactions?limit=100").then((r) => r.json()),
      ]);
      setSummary(s);
      setTransactions(t.transactions ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return <div className="mt-8 text-center text-sm" style={{ color: "var(--ink-muted)" }}>Loading…</div>;
  }

  return (
    <>
      {summary && (
        <RunwayHero
          health={summary.health}
          balance={summary.balance}
          runwayDays={summary.runway_days}
          pctSpent={summary.pct_spent}
          daysElapsed={summary.days_elapsed}
          cycleDay={summary.salary_day ?? 1}
        />
      )}

      <div className="flex gap-1 mt-4">
        {(["overview", "transactions", "upload"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider"
            style={{
              background: tab === t ? "var(--primary)" : "var(--grey-50)",
              color: tab === t ? "white" : "var(--ink-muted)",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "transactions" && <TransactionList transactions={transactions} />}
      {tab === "upload" && <StatementUpload onSuccess={load} />}
      {tab === "overview" && transactions.length === 0 && (
        <div className="mt-8 text-center">
          <p className="text-sm" style={{ color: "var(--ink-muted)" }}>No transactions yet</p>
          <button
            onClick={() => setTab("upload")}
            className="mt-3 px-4 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ background: "var(--primary)" }}
          >
            Upload bank statement
          </button>
        </div>
      )}
    </>
  );
}
