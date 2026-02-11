"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

type ContactRow = {
  id: string;
  fullName: string;
  email: string | null;
  company: string | null;
  role: string | null;
  sourceName: string;
};

type DeleteContactFn = (contactId: string) => Promise<{ error?: string }>;

export function NetworkPageClient({
  contacts,
  initialQuery,
  onDeleteContact,
}: {
  contacts: ContactRow[];
  initialQuery: string;
  onDeleteContact: DeleteContactFn;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  async function handleDelete(id: string) {
    const result = await onDeleteContact(id);
    if (result.error) {
      alert(result.error);
      return;
    }
    startTransition(() => router.refresh());
  }
  return (
    <div className="mt-6">
      <form method="get" action="/network" className="mb-6">
        <label htmlFor="search" className="sr-only">
          Search by name, company, or role
        </label>
        <input
          id="search"
          type="search"
          name="q"
          defaultValue={initialQuery}
          placeholder="Search by name, company, role"
          className="w-full max-w-sm rounded border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
        />
        <button
          type="submit"
          className="mt-2 rounded bg-zinc-800 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 sm:ml-2 sm:mt-0"
        >
          Search
        </button>
      </form>

      <div className="overflow-hidden rounded border border-zinc-200 bg-white">
        {contacts.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-zinc-500">
            No contacts match your search.
          </p>
        ) : (
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50">
                <th className="px-4 py-3 font-medium text-zinc-700">Name</th>
                <th className="px-4 py-3 font-medium text-zinc-700">Email</th>
                <th className="px-4 py-3 font-medium text-zinc-700">Company</th>
                <th className="px-4 py-3 font-medium text-zinc-700">Role</th>
                <th className="px-4 py-3 font-medium text-zinc-700">Source</th>
                <th className="w-20 px-4 py-3 font-medium text-zinc-700">
                  <span className="sr-only">Delete</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-zinc-100 last:border-0"
                >
                  <td className="px-4 py-3 text-zinc-900">{c.fullName}</td>
                  <td className="px-4 py-3 text-zinc-600">{c.email ?? "—"}</td>
                  <td className="px-4 py-3 text-zinc-600">{c.company ?? "—"}</td>
                  <td className="px-4 py-3 text-zinc-600">{c.role ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700">
                      {c.sourceName}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => handleDelete(c.id)}
                      disabled={isPending}
                      className="text-xs text-zinc-500 underline hover:text-red-600 disabled:opacity-50"
                      aria-label={`Delete ${c.fullName}`}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <p className="mt-3 text-xs text-zinc-500">
        {contacts.length} contact{contacts.length !== 1 ? "s" : ""}
      </p>
    </div>
  );
}
