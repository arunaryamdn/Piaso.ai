"use client";
import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function UploadPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) return;

    const token = (session as any)?.backendToken ?? "";
    const form = new FormData();
    form.append("file", file);

    setStatus("uploading");
    try {
      const res = await fetch("/api/portfolio/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.detail ?? "Upload failed");
      setStatus("done");
      setMessage(json.message ?? "Upload successful!");
      setTimeout(() => router.push("/invest"), 1500);
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message);
    }
  }

  return (
    <div className="mt-8 px-2">
      <h1 className="font-display font-bold text-2xl mb-1" style={{ color: "var(--ink-primary)" }}>
        Upload Portfolio
      </h1>
      <p className="text-sm mb-6" style={{ color: "var(--ink-muted)" }}>
        Export your holdings from Zerodha Console as Excel (.xlsx) and upload here.
      </p>

      <form onSubmit={handleUpload} className="flex flex-col gap-4">
        <label
          className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 cursor-pointer"
          style={{ borderColor: "var(--grey-200)", background: "var(--grey-50)" }}
        >
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv,.pdf" className="hidden" />
          <span className="text-2xl mb-2">📁</span>
          <span className="text-sm font-semibold" style={{ color: "var(--ink-secondary)" }}>
            Click to choose file
          </span>
          <span className="text-xs mt-1" style={{ color: "var(--ink-muted)" }}>
            .xlsx, .xls, .csv, .pdf
          </span>
        </label>

        <button
          type="submit"
          disabled={status === "uploading"}
          className="py-3 rounded-xl text-sm font-semibold text-white"
          style={{ background: "var(--primary)", opacity: status === "uploading" ? 0.6 : 1 }}
        >
          {status === "uploading" ? "Uploading…" : "Upload"}
        </button>
      </form>

      {status === "done" && (
        <p className="mt-4 text-sm text-center" style={{ color: "var(--green-600)" }}>{message}</p>
      )}
      {status === "error" && (
        <p className="mt-4 text-sm text-center" style={{ color: "var(--red-600)" }}>{message}</p>
      )}
    </div>
  );
}
