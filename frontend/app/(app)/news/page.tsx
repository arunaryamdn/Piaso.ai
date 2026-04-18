import { auth } from "@/auth";
import { apiFetch } from "@/lib/api";

interface NewsItem {
  title: string;
  source: string;
  url: string;
  published_at: string;
  symbol?: string;
}

export default async function NewsPage() {
  const session = await auth();
  const token = (session as any)?.backendToken ?? "";

  let items: NewsItem[] = [];
  let error: string | null = null;

  try {
    const data = await apiFetch<{ news: NewsItem[] }>("/api/nse/news", token);
    items = data.news ?? [];
  } catch (e: any) {
    if (!e.message?.includes("404")) error = e.message;
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: "var(--font-fraunces), Fraunces, Georgia, serif", fontWeight: 700,
          fontSize: 24, color: "var(--ink-primary)", margin: "0 0 4px" }}>Market News</h1>
        <p style={{ fontSize: 13, color: "var(--ink-muted)", margin: 0 }}>
          NSE updates for your holdings
        </p>
      </div>

      {error && (
        <div style={{ padding: "14px 16px", borderRadius: "var(--r-lg)", background: "var(--red-50)",
          color: "var(--red-600)", fontSize: 13, marginBottom: 16 }}>{error}</div>
      )}

      {!error && items.length === 0 && (
        <div style={{ textAlign: "center", padding: "48px 0" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📰</div>
          <p style={{ fontWeight: 600, fontSize: 15, color: "var(--ink-primary)", margin: "0 0 6px" }}>
            No news yet
          </p>
          <p style={{ fontSize: 13, color: "var(--ink-muted)", margin: 0 }}>
            Upload your portfolio to see news for your holdings.
          </p>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {items.map((item, i) => (
          <a key={i} href={item.url} target="_blank" rel="noopener noreferrer"
            style={{ display: "block", background: "var(--card-bg)", borderRadius: "var(--r-lg)",
              border: "1px solid var(--border)", boxShadow: "var(--shadow-card)",
              padding: "14px 16px", textDecoration: "none" }}>
            {item.symbol && (
              <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: "var(--r-full)",
                background: "var(--grey-50)", color: "var(--primary)", fontSize: 10,
                fontWeight: 700, letterSpacing: 0.5, marginBottom: 6 }}>{item.symbol}</span>
            )}
            <div style={{ fontWeight: 600, fontSize: 14, color: "var(--ink-primary)",
              lineHeight: 1.4, marginBottom: 6 }}>{item.title}</div>
            <div style={{ display: "flex", gap: 8, fontSize: 11, color: "var(--ink-muted)" }}>
              <span>{item.source}</span>
              <span>·</span>
              <span>{new Date(item.published_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
