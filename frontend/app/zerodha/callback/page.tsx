"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";

export default function ZerodhaCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [status, setStatus] = useState<"connecting" | "done" | "error">("connecting");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const requestToken = searchParams.get("request_token");
    if (!requestToken) {
      setStatus("error");
      setMessage("No request_token in URL.");
      return;
    }

    const token = (session as any)?.backendToken ?? "";
    fetch("/api/zerodha/exchange-token", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ request_token: requestToken }),
    })
      .then(r => r.json())
      .then(d => {
        if (d.access_token || d.data?.access_token) {
          setStatus("done");
          setTimeout(() => router.push("/profile"), 1500);
        } else {
          setStatus("error");
          setMessage(d.detail ?? "Failed to connect Zerodha.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Network error. Please try again.");
      });
  }, [searchParams, session]);

  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", background: "var(--page-bg)", padding: 24 }}>
      <Image src="/logo.svg" alt="Piaso.ai" width={48} height={48} style={{ marginBottom: 24 }} />

      {status === "connecting" && (
        <>
          <div style={{ width: 36, height: 36, borderRadius: 999, border: "3px solid var(--primary)",
            borderTopColor: "transparent", animation: "spin 0.8s linear infinite", marginBottom: 16 }} />
          <p style={{ fontSize: 15, fontWeight: 600, color: "var(--ink-primary)" }}>Connecting Zerodha…</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </>
      )}

      {status === "done" && (
        <>
          <div style={{ width: 48, height: 48, borderRadius: 999, background: "var(--green-50)",
            display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--gain)"
              strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <p style={{ fontSize: 15, fontWeight: 600, color: "var(--gain)" }}>Zerodha connected!</p>
          <p style={{ fontSize: 13, color: "var(--ink-muted)", marginTop: 4 }}>Redirecting to profile…</p>
        </>
      )}

      {status === "error" && (
        <>
          <div style={{ width: 48, height: 48, borderRadius: 999, background: "var(--red-50)",
            display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--loss)"
              strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </div>
          <p style={{ fontSize: 15, fontWeight: 600, color: "var(--loss)" }}>Connection failed</p>
          <p style={{ fontSize: 13, color: "var(--ink-muted)", marginTop: 4 }}>{message}</p>
          <button onClick={() => router.push("/profile")}
            style={{ marginTop: 20, padding: "10px 24px", borderRadius: "var(--r-md)",
              background: "var(--primary)", color: "#fff", border: "none", cursor: "pointer",
              fontSize: 13, fontWeight: 600 }}>
            Back to Profile
          </button>
        </>
      )}
    </div>
  );
}
