"use client";

import { useState } from "react";
import { Upload, CheckCircle2, Loader2 } from "lucide-react";

export function FileUploadField({
  name,
  label,
  required,
}: {
  name: string;
  label: string;
  required?: boolean;
}) {
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [url, setUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatus("uploading");
    setError(null);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/uploads", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setUrl(data.url);
      setFileName(data.fileName);
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Upload failed");
    }
  }

  return (
    <div>
      <label className="mb-1 block text-xs uppercase tracking-wide text-aio-silver">
        {label} {required ? <span className="text-aio-red">*</span> : null}
      </label>
      <input type="hidden" name={name} value={url ?? ""} />
      <input type="hidden" name={`${name}_fileName`} value={fileName ?? ""} />
      <label className="flex cursor-pointer items-center gap-3 border border-dashed border-white/20 bg-aio-charcoal px-4 py-3 text-sm hover:border-aio-red">
        {status === "uploading" ? (
          <Loader2 className="animate-spin text-aio-red" size={18} />
        ) : status === "done" ? (
          <CheckCircle2 className="text-green-500" size={18} />
        ) : (
          <Upload className="text-aio-silver" size={18} />
        )}
        <span className="truncate text-aio-silver-light">
          {fileName ?? (status === "uploading" ? "Uploading..." : "Choose file")}
        </span>
        <input type="file" className="hidden" onChange={handleChange} accept="image/*,application/pdf" />
      </label>
      {error ? <p className="mt-1 text-xs text-aio-red">{error}</p> : null}
    </div>
  );
}
