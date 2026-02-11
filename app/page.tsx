import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";

export default async function Home() {
  const session = await getServerSession();
  if (session?.user) {
    redirect("/network");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-xl rounded-2xl border border-zinc-200 bg-white px-6 py-8 shadow-sm">
        <header className="mb-6">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
            WarmPath · Private beta
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-zinc-900">
            Personal network coordination
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            This is not a social network, CRM, or referral marketplace. It&apos;s
            a private, personal network coordination tool.
          </p>
        </header>

        <section className="space-y-2 text-sm text-zinc-700">
          <h2 className="font-medium text-zinc-900">Principles</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Personal networks are private and user-owned.</li>
            <li>Nothing is shared by default.</li>
            <li>
              Atomic action: query your network, then selectively share results.
            </li>
            <li>Projects are optional coordination containers.</li>
            <li>Trust and clarity matter more than polish.</li>
          </ul>
        </section>

        <section className="mt-6 border-t border-dashed border-zinc-200 pt-4">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
            Authentication
          </p>
          <p className="mb-4 text-sm text-zinc-600">
            Sign in with a magic link sent to your email. No passwords.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href="/api/auth/signin"
              className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
            >
              Sign in with email
            </Link>
            <p className="text-xs text-zinc-500">
              Built with Next.js, Prisma, PostgreSQL, and email magic links.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

