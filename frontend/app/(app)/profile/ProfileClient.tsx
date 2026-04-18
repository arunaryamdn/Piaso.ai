"use client";
import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";

interface PortfolioInfo {
  filename: string;
  filesize: number;
  uploaded_at: string;
  status: string;
}

interface Props {
  name: string;
  email: string;
  image: string | null;
  backendToken: string;
}

export default function ProfileClient({ name, email, image, backendToken }: Props) {
  const [portfolio, setPortfolio] = useState<PortfolioInfo | null>(null);
  const [portfolioLoading, setPortfolioLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [deleteMsg, setDeleteMsg] = useState("");

  const initials = name ? name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "P";
  const headers = backendToken ? { Authorization: `Bearer ${backendToken}` } : {};

  useEffect(() => {
    fetch("/api/portfolio/status", { headers })
      .then(r => r.json())
      .then(d => {
        if (d.status === "ready" || d.status === "processing") setPortfolio(d);
      })
      .catch(() => {})
      .finally(() => setPortfolioLoading(false));
  }, []);

  async function handleDelete() {
    if (!confirm("Delete your uploaded portfolio? This cannot be undone.")) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/portfolio", { method: "DELETE", headers });
      const d = await res.json();
      setDeleteMsg(d.message ?? "Deleted");
      setPortfolio(null);
    } catch {
      setDeleteMsg("Delete failed");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* User card */}
      <div style={{ background: "var(--card-bg)", borderRadius: "var(--r-xl)", border: "1px solid var(--border)",
        boxShadow: "var(--shadow-card)", overflow: "hidden" }}>
        <div style={{ background: "var(--primary)", height: 64 }} />
        <div style={{ padding: "0 20px 20px" }}>
          {/* Avatar row — sits half over the teal band */}
          <div style={{ display: "flex", alignItems: "flex-end", gap: 14, marginTop: -28 }}>
            {image ? (
              <img src={image} alt={name} width={56} height={56} style={{ borderRadius: 999,
                border: "3px solid var(--card-bg)", objectFit: "cover", flexShrink: 0 }} />
            ) : (
              <div style={{ width: 56, height: 56, borderRadius: 999, background: "var(--primary)",
                color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20, fontWeight: 700, border: "3px solid var(--card-bg)", flexShrink: 0 }}>
                {initials}
              </div>
            )}
          </div>
          {/* Name + email below avatar — no flex with avatar to avoid overflow */}
          <div style={{ marginTop: 10, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 17, color: "var(--ink-primary)",
              wordBreak: "break-word", overflowWrap: "break-word", lineHeight: 1.3 }}>
              {name || "—"}
            </div>
            <div style={{ fontSize: 12, color: "var(--ink-muted)", marginTop: 3,
              wordBreak: "break-all" }}>{email}</div>
          </div>
        </div>
      </div>

      {/* Portfolio section */}
      <Section title="Portfolio">
        {portfolioLoading ? (
          <div style={{ padding: "16px 0", fontSize: 13, color: "var(--ink-muted)" }}>Loading…</div>
        ) : portfolio ? (
          <div>
            <InfoRow label="File" value={portfolio.filename} />
            <InfoRow label="Size" value={`${(portfolio.filesize / 1024).toFixed(1)} KB`} />
            <InfoRow label="Uploaded" value={portfolio.uploaded_at?.slice(0, 10)} />
            <InfoRow label="Status" value={portfolio.status} highlight={portfolio.status === "ready"} />
            {deleteMsg && (
              <p style={{ fontSize: 12, color: "var(--gain)", margin: "8px 0 0" }}>{deleteMsg}</p>
            )}
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <Link href="/invest/upload"
                style={{ flex: 1, textAlign: "center", padding: "10px", borderRadius: "var(--r-md)",
                  background: "var(--grey-50)", color: "var(--ink-secondary)", fontSize: 13,
                  fontWeight: 600, textDecoration: "none", border: "1px solid var(--border)" }}>
                Re-upload
              </Link>
              <button onClick={handleDelete} disabled={deleting}
                style={{ flex: 1, padding: "10px", borderRadius: "var(--r-md)",
                  background: "var(--red-50)", color: "var(--red-600)", fontSize: 13,
                  fontWeight: 600, border: "none", cursor: "pointer",
                  opacity: deleting ? 0.6 : 1 }}>
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ paddingTop: 4 }}>
            <p style={{ fontSize: 13, color: "var(--ink-muted)", margin: "0 0 12px" }}>
              No portfolio uploaded yet.
            </p>
            <Link href="/invest/upload"
              style={{ display: "inline-block", padding: "10px 20px", borderRadius: "var(--r-md)",
                background: "var(--primary)", color: "#fff", fontSize: 13, fontWeight: 600,
                textDecoration: "none" }}>
              Upload portfolio
            </Link>
          </div>
        )}
      </Section>

      {/* Zerodha section */}
      <Section title="Zerodha">
        <p style={{ fontSize: 13, color: "var(--ink-muted)", margin: "0 0 12px" }}>
          Connect your Zerodha account for live portfolio sync and order tracking.
        </p>
        <Link href="/profile/zerodha"
          style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px",
            borderRadius: "var(--r-md)", background: "var(--primary)", color: "#fff",
            fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
            <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
          </svg>
          Connect Zerodha
        </Link>
      </Section>

      {/* Sign out */}
      <button onClick={() => signOut({ callbackUrl: "/" })}
        style={{ width: "100%", padding: "14px", borderRadius: "var(--r-lg)",
          background: "var(--red-50)", color: "var(--red-600)", fontSize: 14,
          fontWeight: 600, border: "1px solid var(--red-100)", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
          <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        Sign Out
      </button>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "var(--card-bg)", borderRadius: "var(--r-xl)", border: "1px solid var(--border)",
      boxShadow: "var(--shadow-card)", padding: "16px 20px" }}>
      <div style={{ fontWeight: 600, fontSize: 13, textTransform: "uppercase", letterSpacing: 0.8,
        color: "var(--ink-muted)", marginBottom: 12 }}>{title}</div>
      {children}
    </div>
  );
}

function InfoRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0",
      borderBottom: "1px solid var(--border)" }}>
      <span style={{ fontSize: 13, color: "var(--ink-muted)" }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 500,
        color: highlight ? "var(--gain)" : "var(--ink-primary)" }}>{value}</span>
    </div>
  );
}
