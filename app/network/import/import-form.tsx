"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { importFromCsv } from "./actions";

export function ImportForm() {
  const router = useRouter();
  const [status, setStatus] = useState<{
    type: "idle" | "loading" | "success" | "error";
    message?: string;
    added?: number;
    skipped?: number;
  }>({ type: "idle" });

  async function handleSubmit(formData: FormData) {
    setStatus({ type: "loading" });
    const result = await importFromCsv(formData);
    if (result.error) {
      setStatus({ type: "error", message: result.error });
      return;
    }
    setStatus({
      type: "success",
      added: result.added,
      skipped: result.skipped,
      message:
        result.added === 0 && result.skipped > 0
          ? `All ${result.skipped} row(s) were duplicates; nothing added.`
          : `${result.added} contact${result.added !== 1 ? "s" : ""} added to your private network.${result.skipped > 0 ? ` ${result.skipped} duplicate(s) skipped.` : ""}`,
    });
    if (result.added > 0) {
      router.refresh();
    }
  }

  return (
    <form action={handleSubmit} className="mt-4">
      <input
        type="file"
        name="file"
        accept=".csv"
        required
        className="block w-full text-sm text-zinc-600 file:mr-4 file:rounded file:border-0 file:bg-zinc-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-zinc-900"
      />
      <button
        type="submit"
        disabled={status.type === "loading"}
        className="mt-4 rounded bg-zinc-800 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
      >
        {status.type === "loading" ? "Importing…" : "Upload CSV"}
      </button>
      {status.type === "success" && (
        <p className="mt-4 text-sm text-green-700">{status.message}</p>
      )}
      {status.type === "error" && (
        <p className="mt-4 text-sm text-red-600">{status.message}</p>
      )}
    </form>
  );
}
