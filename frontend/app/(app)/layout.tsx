import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");

  const user = session.user;

  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", background: "var(--page-bg)" }}>
      <AppHeader userName={user?.name ?? undefined} userImage={user?.image ?? undefined} />
      <main style={{ flex: 1, maxWidth: 440, width: "100%", margin: "0 auto", padding: "16px 16px 80px" }}>
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
