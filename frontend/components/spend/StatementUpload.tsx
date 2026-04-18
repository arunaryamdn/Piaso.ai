"use client";
import { useState } from "react";

export default function StatementUpload({ onSuccess }: { onSuccess: () => void }) {
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatus("uploading");
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/spend/upload-statement", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail ?? "Upload failed");
      setStatus("done");
      setMessage(`Imported ${data.inserted} transactions`);
      onSuccess();
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message);
    }
  }

  return (
    <div className="mt-4">
      <label
        className="flex flex-col items-center justify-center py-8 px-4 rounded-xl border-2 border-dashed cursor-pointer transition-colors"
        style={{ borderColor: "var(--border)", background: "var(--card-bg)" }}
      >
        <span className="text-2xl mb-2">📄</span>
        <span className="font-semibold text-sm" style={{ color: "var(--primary)" }}>
          Upload bank statement
        </span>
        <span className="text-xs mt-1" style={{ color: "var(--ink-muted)" }}>
          PDF or Excel — HDFC, ICICI, SBI, Axis, Kotak
        </span>
        <input type="file" className="hidden" accept=".pdf,.xlsx,.xls,.csv" onChange={handleFile} />
      </label>
      {status === "uploading" && (
        <p className="text-sm text-center mt-2" style={{ color: "var(--ink-muted)" }}>Parsing statement…</p>
      )}
      {status === "done" && (
        <p className="text-sm text-center mt-2" style={{ color: "var(--gain)" }}>✓ {message}</p>
      )}
      {status === "error" && (
        <p className="text-sm text-center mt-2" style={{ color: "var(--loss)" }}>✗ {message}</p>
      )}
    </div>
  );
}
