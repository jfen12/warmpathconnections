import Link from "next/link";
import { getServerSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { QueryForm } from "./query-form";

export default async function QueryPage() {
  const session = await getServerSession();
  if (!session?.user?.email) {
    redirect("/api/auth/signin");
  }

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

      <main className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="text-lg font-semibold text-zinc-900">
          Network query
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          Find contacts in your private network by company, role, or keyword.
          Querying does not share anything—results are only for you.
        </p>

        <div className="mt-6 rounded border border-zinc-200 bg-white p-6">
          <QueryForm />
        </div>

        <p className="mt-6 text-xs text-zinc-500">
          <Link href="/network" className="underline hover:text-zinc-700">
            Back to your network
          </Link>
        </p>
      </main>
    </div>
  );
}
