"use client";
import { useState } from "react";
import Image from "next/image";
import HamburgerMenu from "./HamburgerMenu";

interface AppHeaderProps {
  userName?: string;
  userImage?: string;
}

export default function AppHeader({ userName, userImage }: AppHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const initials = userName ? userName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "P";

  return (
    <>
      <header style={{ background: "var(--primary)", height: 56, display: "flex", alignItems: "center",
        justifyContent: "space-between", padding: "0 16px", flexShrink: 0, position: "sticky", top: 0, zIndex: 40 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Image src="/logo.svg" alt="Piaso.ai" width={28} height={28} />
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 17, letterSpacing: -0.3,
            fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif" }}>
            Piaso.ai
          </span>
        </div>

        <button onClick={() => setMenuOpen(true)} style={{ background: "none", border: "none",
          padding: 4, cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
          {userImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={userImage} alt={userName ?? "User"} width={28} height={28}
              referrerPolicy="no-referrer"
              style={{ borderRadius: 999, objectFit: "cover" }} />
          ) : (
            <div style={{ width: 28, height: 28, borderRadius: 999, background: "var(--primary-light)",
              color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 600, fontFamily: "var(--font-dm-sans), sans-serif" }}>
              {initials}
            </div>
          )}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"
            strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
      </header>

      <HamburgerMenu open={menuOpen} onClose={() => setMenuOpen(false)}
        userName={userName} userImage={userImage} />
    </>
  );
}
