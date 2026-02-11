import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteContact } from "./import/actions";
import { NetworkPageClient } from "./network-client";

export default async function NetworkPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; imported?: string }>;
}) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    redirect("/api/auth/signin");
  }

  const { q, imported } = await searchParams;
  const search = (typeof q === "string" ? q : "").trim().toLowerCase();
  const importedCount =
    typeof imported === "string" && /^\d+$/.test(imported)
      ? parseInt(imported, 10)
      : null;
  const userId = (session.user as { id: string }).id;

  const contacts = await prisma.personalContact.findMany({
    where: {
      ownerId: userId,
      ...(search
        ? {
            OR: [
              { fullName: { contains: search, mode: "insensitive" } },
              { company: { contains: search, mode: "insensitive" } },
              { role: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      source: true,
    },
    orderBy: { fullName: "asc" },
  });

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/network" className="text-sm font-medium text-zinc-900">
            WarmPath
          </Link>
          <span className="text-sm text-zinc-500">{session.user.email}</span>
          <Link
            href="/api/auth/signout"
            className="text-sm text-zinc-600 underline hover:text-zinc-900"
          >
            Sign out
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6">
        <h1 className="text-lg font-semibold text-zinc-900">
          Personal network
        </h1>
        <p className="mt-1 text-sm text-zinc-600">
          Your contacts. Only you can see this list.
        </p>

        {importedCount !== null && importedCount > 0 && (
          <div
            className="mt-4 rounded border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
            role="status"
          >
            {importedCount} contact{importedCount !== 1 ? "s" : ""} added to your
            private network. Contacts are private and not shared.
          </div>
        )}

        <div className="mt-4 flex items-center gap-4">
          <Link
            href="/network/query"
            className="text-sm font-medium text-zinc-700 underline hover:text-zinc-900"
          >
            Query network
          </Link>
          <Link
            href="/network/import"
            className="text-sm font-medium text-zinc-700 underline hover:text-zinc-900"
          >
            Import contacts
          </Link>
        </div>

        <NetworkPageClient
          contacts={contacts.map((c) => ({
            id: c.id,
            fullName: c.fullName,
            email: c.email ?? null,
            company: c.company ?? null,
            role: c.role ?? null,
            sourceName: c.source?.name ?? "—",
          }))}
          initialQuery={search}
          onDeleteContact={deleteContact}
        />
      </main>
    </div>
  );
}
