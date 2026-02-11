import Link from "next/link";
import { getServerSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ImportForm } from "./import-form";

export default async function ImportPage() {
  const session = await getServerSession();
  if (!session?.user?.email) {
    redirect("/api/auth/signin");
  }

  const googleEnabled = !!(
    process.env.GOOGLE_IMPORT_CLIENT_ID &&
    process.env.GOOGLE_IMPORT_CLIENT_SECRET
  );

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
          Import contacts
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          Imported contacts are stored only in your private network. They are
          not shared with anyone unless you explicitly share them later.
        </p>

        <div className="mt-6 space-y-8">
          <section className="rounded border border-zinc-200 bg-white p-6">
            <h2 className="text-sm font-medium text-zinc-900">CSV upload</h2>
            <p className="mt-1 text-sm text-zinc-600">
              Upload a CSV with columns: <strong>name</strong>,{" "}
              <strong>company</strong>, <strong>role</strong> (first row can be
              headers). Duplicates by name + company are skipped.
            </p>
            <ImportForm />
          </section>

          {googleEnabled && (
            <section className="rounded border border-zinc-200 bg-white p-6">
              <h2 className="text-sm font-medium text-zinc-900">
                Google Contacts
              </h2>
              <p className="mt-1 text-sm text-zinc-600">
                Import contacts from your Google account. We only read contact
                names and organizations; nothing is shared back.
              </p>
              <a
                href="/api/import/google"
                className="mt-4 inline-flex items-center rounded bg-zinc-800 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
              >
                Import from Google
              </a>
            </section>
          )}
        </div>

        <p className="mt-8 text-xs text-zinc-500">
          Contacts are private and not shared. You can delete any imported
          contact from your network list.
        </p>
      </main>
    </div>
  );
}
