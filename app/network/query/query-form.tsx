"use client";

import { useState } from "react";
import { runNetworkQuery } from "./actions";
import type { ScoredContact } from "@/lib/query-network";

export function QueryForm() {
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [results, setResults] = useState<ScoredContact[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setStatus("loading");
    const { results: r, error: err } = await runNetworkQuery({
      company: company || undefined,
      role: role || undefined,
      keyword: keyword || undefined,
    });
    setStatus("done");
    if (err) {
      setError(err);
      setResults([]);
      return;
    }
    setResults(r);
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-zinc-600">
          Query runs only over your personal contacts. Results are not shared
          with anyone.
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="query-company" className="block text-xs font-medium text-zinc-700">
              Company
            </label>
            <input
              id="query-company"
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Acme Inc"
              className="mt-1 w-full rounded border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
            />
          </div>
          <div>
            <label htmlFor="query-role" className="block text-xs font-medium text-zinc-700">
              Role
            </label>
            <input
              id="query-role"
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Engineer"
              className="mt-1 w-full rounded border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
            />
          </div>
          <div>
            <label htmlFor="query-keyword" className="block text-xs font-medium text-zinc-700">
              Keyword
            </label>
            <input
              id="query-keyword"
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="e.g. design"
              className="mt-1 w-full rounded border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded bg-zinc-800 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
        >
          {status === "loading" ? "Querying…" : "Run query"}
        </button>
      </form>

      {error && (
        <p className="mt-4 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {status === "done" && results.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-medium text-zinc-900">
            Results ({results.length})
          </h2>
          <ul className="mt-3 space-y-4">
            {results.map((c) => (
              <li
                key={c.id}
                className="rounded border border-zinc-200 bg-white p-4 text-sm"
              >
                <div className="font-medium text-zinc-900">{c.fullName}</div>
                <div className="mt-1 text-zinc-600">
                  {c.company ?? "—"} · {c.role ?? "—"}
                </div>
                <div className="mt-2 text-zinc-500">
                  <span className="font-medium text-zinc-700">Why this match:</span>{" "}
                  {c.whyMatch.length > 0
                    ? c.whyMatch.join(" ")
                    : "Relevant to your filters."}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {status === "done" && results.length === 0 && !error && (
        <p className="mt-4 text-sm text-zinc-500">
          No contacts matched your filters. Try different company, role, or
          keyword.
        </p>
      )}
    </>
  );
}
