"use client";
import { useState } from "react";

interface Transaction {
  id: number;
  date: string;
  description: string;
  amount: number;
  transaction_type: string;
  confidence: string;
}

const TYPE_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  income:        { bg: "var(--green-50)",  text: "var(--green-600)",  label: "SALARY" },
  investment:    { bg: "#DBEAFE",           text: "#2563EB",           label: "SIP" },
  committed:     { bg: "var(--amber-50)",  text: "var(--amber-600)",  label: "EMI" },
  discretionary: { bg: "var(--grey-50)",   text: "var(--grey-600)",   label: "SPEND" },
};

export default function TransactionList({ transactions }: { transactions: Transaction[] }) {
  const [filter, setFilter] = useState<string>("all");
  const filters = ["all", "income", "committed", "investment", "discretionary"];
  const filtered = filter === "all" ? transactions : transactions.filter((t) => t.transaction_type === filter);

  return (
    <div className="mt-4">
      <div className="flex gap-2 overflow-x-auto pb-1 mb-3">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="shrink-0 text-[10px] uppercase tracking-wider font-semibold px-3 py-1.5 rounded-full"
            style={{
              background: filter === f ? "var(--primary)" : "var(--grey-50)",
              color: filter === f ? "white" : "var(--ink-muted)",
            }}
          >
            {f}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-1">
        {filtered.map((tx) => {
          const badge = TYPE_BADGE[tx.transaction_type] ?? TYPE_BADGE.discretionary;
          const isCredit = tx.amount > 0;
          return (
            <div
              key={tx.id}
              className="flex items-center py-3 px-4 rounded-xl"
              style={{ background: "var(--card-bg)", border: "1px solid var(--border)" }}
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate" style={{ color: "var(--ink-primary)" }}>
                  {tx.description}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px]" style={{ color: "var(--ink-muted)" }}>{tx.date}</span>
                  <span
                    className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                    style={{ background: badge.bg, color: badge.text }}
                  >
                    {badge.label}
                  </span>
                </div>
              </div>
              <p
                className="tabular font-semibold text-sm ml-3"
                style={{ color: isCredit ? "var(--gain)" : "var(--ink-secondary)" }}
              >
                {isCredit ? "+" : "−"}₹{Math.abs(tx.amount).toLocaleString("en-IN")}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
