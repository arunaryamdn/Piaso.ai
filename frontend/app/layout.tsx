import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Piaso.ai",
  description: "Your investments and spend, in one place.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
