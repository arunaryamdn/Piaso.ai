export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", background: "var(--page-bg)", padding: "24px 16px" }}>
      <div style={{ width: "100%", maxWidth: 380 }}>{children}</div>
    </div>
  );
}
