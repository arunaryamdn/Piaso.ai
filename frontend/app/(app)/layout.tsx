import { auth } from "@/auth";
import { redirect } from "next/navigation";
import BottomNav from "@/components/BottomNav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen pb-20" style={{ background: "var(--page-bg)" }}>
      <main className="max-w-[440px] mx-auto px-4">{children}</main>
      <BottomNav />
    </div>
  );
}
