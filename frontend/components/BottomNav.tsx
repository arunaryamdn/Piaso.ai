"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/pulse",  label: "Pulse",  icon: "📈" },
  { href: "/invest", label: "Invest", icon: "🌱" },
  { href: "/spend",  label: "Spend",  icon: "🏺" },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 flex justify-around items-center py-3 border-t"
      style={{ background: "var(--card-bg)", borderColor: "var(--border)", zIndex: 50 }}
    >
      {tabs.map((t) => {
        const active = pathname.startsWith(t.href);
        return (
          <Link key={t.href} href={t.href} className="flex flex-col items-center gap-0.5 min-w-[60px]">
            <span className="text-xl">{t.icon}</span>
            <span
              className="text-[9px] font-semibold uppercase tracking-wider"
              style={{ color: active ? "var(--primary)" : "var(--ink-muted)" }}
            >
              {t.label}
            </span>
            {active && (
              <span className="w-1 h-1 rounded-full mt-0.5" style={{ background: "var(--primary)" }} />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
