"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  {
    href: "/pulse",
    label: "Pulse",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke={active ? "var(--primary)" : "var(--ink-muted)"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12h3l2-6 4 12 2-6h7"/>
      </svg>
    ),
  },
  {
    href: "/invest",
    label: "Invest",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke={active ? "var(--primary)" : "var(--ink-muted)"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
        <polyline points="16 7 22 7 22 13"/>
      </svg>
    ),
  },
  {
    href: "/spend",
    label: "Spend",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke={active ? "var(--primary)" : "var(--ink-muted)"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="7" y="3" width="10" height="3" rx="1"/>
        <path d="M5 7h14l-1 13a2 2 0 01-2 2H8a2 2 0 01-2-2L5 7z"/>
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "var(--card-bg)",
      borderTop: "1px solid var(--border)", display: "flex", height: 60, zIndex: 30,
      boxShadow: "0 -2px 12px rgba(0,0,0,0.06)" }}>
      {tabs.map(tab => {
        const active = pathname === tab.href || pathname.startsWith(tab.href + "/");
        return (
          <Link key={tab.href} href={tab.href}
            style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", gap: 3, textDecoration: "none",
              color: active ? "var(--primary)" : "var(--ink-muted)" }}>
            {tab.icon(active)}
            <span style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8 }}>
              {tab.label}
            </span>
            {active && (
              <div style={{ width: 4, height: 4, borderRadius: 999, background: "var(--primary)", marginTop: 1 }} />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
