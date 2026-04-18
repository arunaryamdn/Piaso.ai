import { auth } from "@/auth";
import { apiFetch } from "@/lib/api";

interface Recommendation {
  symbol: string;
  recommendation: string;
  reason: string;
  current_price: number;
  gain_loss_pct: number;
}

const badgeStyle: Record<string, { bg: string; color: string }> = {
  "Buy More": { bg: "var(--green-50)",  color: "var(--gain)" },
  "Hold":     { bg: "var(--grey-50)",   color: "var(--grey-600)" },
  "Sell":     { bg: "var(--red-50)",    color: "var(--loss)" },
};

export default async function AIPage() {
  const session = await auth();
  const token = (session as any)?.backendToken ?? "";

  let recs: Recommendation[] = [];
  let error: string | null = null;

  try {
    const data = await apiFetch<{ recommendations: Recommendation[] }>("/api/dashboard/recommendations", token);
    recs = data.recommendations ?? [];
  } catch (e: any) {
    if (!e.message?.includes("404")) error = e.message;
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: "var(--font-fraunces), Fraunces, Georgia, serif", fontWeight: 700,
          fontSize: 24, color: "var(--ink-primary)", margin: "0 0 4px" }}>AI Advisor</h1>
        <p style={{ fontSize: 13, color: "var(--ink-muted)", margin: 0 }}>
          Powered by your portfolio data
        </p>
      </div>

      {error && (
        <div style={{ padding: "14px 16px", borderRadius: "var(--r-lg)", background: "var(--red-50)",
          color: "var(--red-600)", fontSize: 13, marginBottom: 16 }}>{error}</div>
      )}

      {!error && recs.length === 0 && (
        <div style={{ textAlign: "center", padding: "48px 0" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>✦</div>
          <p style={{ fontWeight: 600, fontSize: 15, color: "var(--ink-primary)", margin: "0 0 6px" }}>
            No recommendations yet
          </p>
          <p style={{ fontSize: 13, color: "var(--ink-muted)", margin: 0 }}>
            Upload your portfolio to get AI-powered insights.
          </p>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {recs.map(rec => {
          const badge = badgeStyle[rec.recommendation] ?? badgeStyle["Hold"];
          return (
            <div key={rec.symbol} style={{ background: "var(--card-bg)", borderRadius: "var(--r-lg)",
              border: "1px solid var(--border)", boxShadow: "var(--shadow-card)", padding: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                marginBottom: 8 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "var(--ink-primary)" }}>{rec.symbol}</div>
                  <div style={{ fontSize: 12, color: "var(--ink-muted)", marginTop: 2 }}>
                    ₹{rec.current_price?.toLocaleString("en-IN")} ·{" "}
                    <span style={{ color: rec.gain_loss_pct >= 0 ? "var(--gain)" : "var(--loss)" }}>
                      {rec.gain_loss_pct >= 0 ? "+" : ""}{rec.gain_loss_pct?.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <span style={{ padding: "4px 10px", borderRadius: "var(--r-full)", fontSize: 11,
                  fontWeight: 600, ...badge }}>{rec.recommendation}</span>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <span style={{ color: "var(--ink-muted)", fontSize: 14, lineHeight: 1 }}>✦</span>
                <p style={{ fontSize: 13, color: "var(--ink-secondary)", margin: 0, lineHeight: 1.5 }}>
                  {rec.reason}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
