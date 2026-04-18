"use client";
import { useState } from "react";

interface Holding {
  symbol: string;
  name?: string;
  qty: number;
  avgPrice: number;
  currentPrice: number;
  currentValue: number;
  gainLoss: number;
  gainLossPct: number;
}

export default function HoldingsTable({ holdings }: { holdings: Holding[] }) {
  const [sort, setSort] = useState<"value" | "gain">("value");
  const sorted = [...holdings].sort((a, b) =>
    sort === "value" ? b.currentValue - a.currentValue : b.gainLossPct - a.gainLossPct
  );

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-sm" style={{ color: "var(--ink-secondary)" }}>
          Holdings ({holdings.length})
        </h2>
        <div className="flex gap-1">
          {(["value", "gain"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className="text-[10px] uppercase tracking-wider font-semibold px-2 py-1 rounded-full"
              style={{
                background: sort === s ? "var(--primary)" : "var(--grey-50)",
                color: sort === s ? "white" : "var(--ink-muted)",
              }}
            >
              {s === "value" ? "Value" : "Returns"}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-0.5">
        {sorted.map((h) => {
          const isGain = h.gainLoss >= 0;
          const sign = isGain ? "+" : "";
          return (
            <div
              key={h.symbol}
              className="flex items-center py-3 px-4 rounded-xl"
              style={{ background: "var(--card-bg)", border: "1px solid var(--border)" }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold mr-3 shrink-0"
                style={{ background: "var(--primary)" }}
              >
                {h.symbol.slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate" style={{ color: "var(--ink-primary)" }}>{h.symbol}</p>
                <p className="text-xs" style={{ color: "var(--ink-muted)" }}>
                  {h.qty} × ₹{h.avgPrice.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="text-right">
                <p className="tabular font-semibold text-sm" style={{ color: "var(--ink-primary)" }}>
                  ₹{h.currentValue.toLocaleString("en-IN")}
                </p>
                <p className="tabular text-xs font-semibold" style={{ color: isGain ? "var(--gain)" : "var(--loss)" }}>
                  {sign}{h.gainLossPct.toFixed(1)}% {isGain ? "↑" : "↓"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
