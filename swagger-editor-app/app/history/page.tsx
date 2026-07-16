import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_COOKIE_NAME } from "../lib/auth-cookie";
import { getRequestHistoryEntries } from "../api/request-history/history-store";

const formatTimestamp = (timestamp: string) => {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp));
};

export default async function HistoryPage() {
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    redirect("/");
  }

  const entries = getRequestHistoryEntries(token);

  return (
    <main className="mx-auto min-h-[70vh] max-w-6xl px-6 py-20 lg:px-8">
      <div className="mb-10 rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-zinc-500">History & Analytics</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 dark:text-white">Recent API requests</h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-300">
          Review your executed requests, inspect analytics, and click any entry for full details.
        </p>
      </div>

      {entries.length === 0 ? (
        <section className="rounded-3xl border border-zinc-200 bg-white p-10 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-zinc-500">No requests yet</p>
          <h2 className="mt-3 text-2xl font-semibold text-zinc-950 dark:text-white">You haven&apos;t executed any requests yet</h2>
          <p className="mt-3 text-zinc-600 dark:text-zinc-300">
            Execute a request from the editor to populate your history, then return here to review analytics.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/"
              className="rounded-full bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-300"
            >
              Go to Editor
            </Link>
            <Link
              href="/about"
              className="rounded-full border border-zinc-300 px-5 py-3 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-950 dark:border-zinc-700 dark:text-zinc-200 dark:hover:text-white"
            >
              Go to Viewer
            </Link>
          </div>
        </section>
      ) : (
        <section className="space-y-4">
          {entries.map((entry) => (
            <Link
              key={entry.id}
              href={`/history/${entry.id}`}
              className="block rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700 dark:hover:bg-zinc-900"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.35em] text-zinc-500">{entry.method}</p>
                  <h2 className="mt-2 text-xl font-semibold tracking-tight text-zinc-950 dark:text-white">{entry.path}</h2>
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{entry.url}</p>
                </div>
                <div className="flex flex-wrap gap-2 text-sm">
                  <span className="rounded-full bg-zinc-100 px-3 py-1 text-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
                    {entry.response.status} status
                  </span>
                  <span className="rounded-full bg-zinc-100 px-3 py-1 text-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
                    {entry.durationMs} ms
                  </span>
                  <span className="rounded-full bg-zinc-100 px-3 py-1 text-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
                    {formatTimestamp(entry.timestamp)}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </section>
      )}
    </main>
  );
}
