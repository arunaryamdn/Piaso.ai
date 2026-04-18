"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

interface HamburgerMenuProps {
  open: boolean;
  onClose: () => void;
  userName?: string;
  userImage?: string;
}

const navItems = [
  { href: "/pulse",  label: "Pulse Overview", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12h3l2-6 4 12 2-6h7"/>
    </svg>
  )},
  { href: "/invest", label: "Investments", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
    </svg>
  )},
  { href: "/spend",  label: "Spend", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="7" y="3" width="10" height="3" rx="1"/><path d="M5 7h14l-1 13a2 2 0 01-2 2H8a2 2 0 01-2-2L5 7z"/>
    </svg>
  )},
];

const secondaryItems = [
  { href: "/ai",    label: "AI Advisor", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a7 7 0 017 7c0 3-1.5 5-3 6.5V17H8v-1.5C6.5 14 5 12 5 9a7 7 0 017-7z"/>
      <line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
    </svg>
  )},
  { href: "/news",  label: "Market News", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 22h16a2 2 0 002-2V4a2 2 0 00-2-2H8a2 2 0 00-2 2v16a2 2 0 01-2 2zm0 0a2 2 0 01-2-2v-9c0-1.1.9-2 2-2h2"/>
      <line x1="10" y1="8" x2="16" y2="8"/><line x1="10" y1="12" x2="16" y2="12"/>
    </svg>
  )},
];

const utilityItems = [
  { href: "/profile",          label: "Profile & Settings", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  )},
  { href: "/profile#zerodha",  label: "Connect Zerodha", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
      <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
    </svg>
  )},
];

export default function HamburgerMenu({ open, onClose, userName, userImage }: HamburgerMenuProps) {
  const pathname = usePathname();
  const initials = userName ? userName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "P";

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
        zIndex: 50, backdropFilter: "blur(2px)", WebkitBackdropFilter: "blur(2px)" }} />

      {/* Drawer */}
      <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 280,
        background: "var(--card-bg)", zIndex: 51, display: "flex", flexDirection: "column",
        boxShadow: "var(--shadow-lg)", overflowY: "auto" }}>

        {/* Header */}
        <div style={{ background: "var(--primary)", padding: "20px 16px 16px", display: "flex",
          justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {userImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={userImage} alt={userName ?? ""} width={40} height={40}
                referrerPolicy="no-referrer"
                style={{ borderRadius: 999, objectFit: "cover", border: "2px solid rgba(255,255,255,0.3)" }} />
            ) : (
              <div style={{ width: 40, height: 40, borderRadius: 999, background: "var(--primary-light)",
                color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 15, fontWeight: 700 }}>{initials}</div>
            )}
            <div>
              <div style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>{userName ?? "User"}</div>
              <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 11 }}>Piaso.ai</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer",
            color: "rgba(255,255,255,0.7)", padding: 4 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Nav sections */}
        <div style={{ flex: 1, padding: "8px 0" }}>
          <NavSection items={navItems} pathname={pathname} onClose={onClose} />
          <Divider />
          <NavSection items={secondaryItems} pathname={pathname} onClose={onClose} />
          <Divider />
          <NavSection items={utilityItems} pathname={pathname} onClose={onClose} />
        </div>

        {/* Sign out */}
        <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border)" }}>
          <button onClick={() => signOut({ callbackUrl: "/" })}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "12px 12px",
              borderRadius: "var(--r-md)", border: "none", background: "var(--red-50)",
              color: "var(--red-600)", cursor: "pointer", fontSize: 14, fontWeight: 600 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
              <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
}

function NavSection({ items, pathname, onClose }: { items: typeof navItems; pathname: string; onClose: () => void }) {
  return (
    <div style={{ padding: "4px 8px" }}>
      {items.map(item => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link key={item.href} href={item.href} onClick={onClose}
            style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 12px",
              borderRadius: "var(--r-md)", textDecoration: "none",
              color: active ? "var(--primary)" : "var(--ink-secondary)",
              background: active ? "var(--grey-50)" : "transparent",
              fontWeight: active ? 600 : 400, fontSize: 14 }}>
            {item.icon}
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: "var(--border)", margin: "4px 16px" }} />;
}
