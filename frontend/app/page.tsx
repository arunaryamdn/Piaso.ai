import Image from "next/image";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div style={{ minHeight: "100dvh", background: "var(--page-bg)", display: "flex", flexDirection: "column" }}>

      {/* Top bar */}
      <header style={{ background: "var(--primary)", padding: "14px 20px", display: "flex",
        alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Image src="/logo.svg" alt="Piaso.ai" width={28} height={28} />
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 17, letterSpacing: -0.3 }}>Piaso.ai</span>
        </div>
        <Link href="/login" style={{ padding: "7px 16px", borderRadius: "var(--r-full)",
          border: "1.5px solid rgba(255,255,255,0.5)", color: "#fff", fontSize: 13,
          fontWeight: 600, textDecoration: "none" }}>
          Sign in
        </Link>
      </header>

      {/* Hero band */}
      <div style={{ background: "var(--primary)", padding: "40px 24px 56px" }}>
        <div style={{ maxWidth: 440, margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px",
            borderRadius: "var(--r-full)", background: "rgba(255,255,255,0.12)", marginBottom: 20 }}>
            <div style={{ width: 6, height: 6, borderRadius: 999, background: "#34D399" }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.8)",
              textTransform: "uppercase", letterSpacing: 0.8 }}>Free · No spreadsheets</span>
          </div>

          <h1 style={{ fontFamily: "var(--font-fraunces), Fraunces, Georgia, serif",
            fontWeight: 700, fontSize: "clamp(34px, 10vw, 46px)", lineHeight: 1.08,
            letterSpacing: -0.03, color: "#fff", margin: "0 0 16px" }}>
            Am I okay<br />this month?
          </h1>

          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.72)", lineHeight: 1.65,
            margin: "0 0 32px", maxWidth: 320 }}>
            Piaso.ai shows your salary, investments, and spending in one honest view —
            so you always know where you stand.
          </p>

          <Link href="/login" style={{ display: "inline-flex", alignItems: "center", gap: 10,
            padding: "14px 24px", borderRadius: "var(--r-lg)", background: "#fff",
            color: "var(--primary)", fontSize: 15, fontWeight: 700, textDecoration: "none",
            boxShadow: "0 4px 20px rgba(0,0,0,0.25)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Check your financial health
          </Link>
        </div>
      </div>

      {/* Mini pulse preview */}
      <div style={{ maxWidth: 440, margin: "-24px auto 0", padding: "0 20px", width: "100%", position: "relative", zIndex: 2 }}>
        <div style={{ background: "var(--card-bg)", borderRadius: "var(--r-xl)",
          boxShadow: "var(--shadow-lg)", border: "1px solid var(--border)", padding: "18px 20px" }}>
          <div style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8,
            color: "var(--green-600)", marginBottom: 6 }}>Net Worth · Apr 2026</div>
          <div style={{ fontFamily: "var(--font-fraunces), Fraunces, Georgia, serif",
            fontWeight: 700, fontSize: 28, color: "var(--ink-primary)",
            fontVariantNumeric: "tabular-nums", letterSpacing: -0.01, marginBottom: 4 }}>
            ₹23,45,000
          </div>
          <div style={{ fontSize: 13, color: "var(--gain)", fontWeight: 600, marginBottom: 14 }}>↑ +2.3% this month</div>
          <div style={{ display: "flex", gap: 8 }}>
            <MiniCard label="Investments" value="₹23.4L" badge="● +12%" badgeBg="#D1FAE5" badgeColor="#047857" />
            <MiniCard label="Spend runway" value="22 days" badge="● On track" badgeBg="#D1FAE5" badgeColor="#047857" />
          </div>
        </div>
      </div>

      {/* Features */}
      <main style={{ maxWidth: 440, width: "100%", margin: "0 auto", padding: "28px 20px 48px" }}>
        <p style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8,
          color: "var(--ink-muted)", marginBottom: 16 }}>What you get</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <FeatureRow emoji="📈" title="Portfolio analytics"
            desc="Upload Zerodha holdings. See P&L, CAGR, and AI buy/sell/hold signals in real time." />
          <FeatureRow emoji="🏦" title="Salary cycle tracker"
            desc="Upload your bank statement. Instantly see how many days of runway you have left." />
          <FeatureRow emoji="✦" title="AI advisor"
            desc="Per-holding recommendations based on your actual returns — not generic advice." />
          <FeatureRow emoji="📰" title="News for your stocks"
            desc="Market news filtered to the exact companies you own. No noise." />
        </div>
      </main>

      <footer style={{ padding: "20px 24px", textAlign: "center" }}>
        <p style={{ fontSize: 11, color: "var(--ink-muted)", margin: 0 }}>© 2026 Piaso.ai · Built for India</p>
      </footer>
    </div>
  );
}

function MiniCard({ label, value, badge, badgeBg, badgeColor }: {
  label: string; value: string; badge: string; badgeBg: string; badgeColor: string;
}) {
  return (
    <div style={{ flex: 1, borderRadius: "var(--r-lg)", border: "1px solid var(--border)", padding: "12px 14px" }}>
      <div style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8,
        color: "var(--ink-muted)", marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: "var(--font-fraunces), Fraunces, Georgia, serif",
        fontWeight: 700, fontSize: 18, color: "var(--ink-primary)",
        fontVariantNumeric: "tabular-nums", marginBottom: 6 }}>{value}</div>
      <span style={{ display: "inline-flex", padding: "2px 8px", borderRadius: "var(--r-full)",
        background: badgeBg, color: badgeColor, fontSize: 9, fontWeight: 700, letterSpacing: 0.5 }}>
        {badge}
      </span>
    </div>
  );
}

function FeatureRow({ emoji, title, desc }: { emoji: string; title: string; desc: string }) {
  return (
    <div style={{ display: "flex", gap: 14, padding: "14px 16px", borderRadius: "var(--r-lg)",
      background: "var(--card-bg)", border: "1px solid var(--border)" }}>
      <div style={{ fontSize: 20, width: 32, flexShrink: 0, textAlign: "center", paddingTop: 1 }}>{emoji}</div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: "var(--ink-primary)", marginBottom: 3 }}>{title}</div>
        <div style={{ fontSize: 12, color: "var(--ink-muted)", lineHeight: 1.5 }}>{desc}</div>
      </div>
    </div>
  );
}
