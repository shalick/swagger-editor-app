import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { AUTH_COOKIE_NAME } from "../../lib/auth-cookie";
import { getRequestHistoryEntryById } from "../../api/request-history/history-store";
import type { RequestHistoryEntry } from "../../api/request-history/history-store";

interface HistoryEntryPageProps {
  params: { id: string };
}

const formatTimestamp = (timestamp: string) => {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp));
};

const renderHeader = (entry: RequestHistoryEntry) => (
  <div className="mb-6 flex flex-col gap-2 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-zinc-500">Request details</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 dark:text-white">{entry.method} {entry.path}</h1>
      </div>
      <div className="rounded-3xl bg-zinc-100 px-4 py-3 text-sm font-semibold text-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
        {entry.response.status} • {entry.durationMs} ms
      </div>
    </div>
    <p className="text-sm text-zinc-600 dark:text-zinc-300">{formatTimestamp(entry.timestamp)}</p>
  </div>
);

export default async function HistoryEntryPage({ params }: HistoryEntryPageProps) {
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    redirect("/");
  }

  const entry = getRequestHistoryEntryById(token, params.id);
  if (!entry) {
    notFound();
  }

  return (
    <main className="mx-auto min-h-[70vh] max-w-5xl px-6 py-20 lg:px-8">
      {renderHeader(entry)}

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-zinc-500">Request analytics</p>
          <div className="mt-6 space-y-4 text-sm text-zinc-700 dark:text-zinc-200">
            <div className="grid grid-cols-2 gap-4 rounded-3xl bg-zinc-50 p-4 dark:bg-zinc-900">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">Request size</p>
                <p className="mt-1 font-semibold">{entry.requestSize} bytes</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">Response size</p>
                <p className="mt-1 font-semibold">{entry.responseSize} bytes</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 rounded-3xl bg-zinc-50 p-4 dark:bg-zinc-900">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">Method</p>
                <p className="mt-1 font-semibold">{entry.method}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">URL</p>
                <p className="mt-1 font-semibold break-all">{entry.url}</p>
              </div>
            </div>
            <div className="rounded-3xl bg-zinc-50 p-4 dark:bg-zinc-900">
              <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">Error details</p>
              <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-200">{entry.error ?? 'None'}</p>
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-zinc-500">Endpoint</p>
            <p className="mt-3 font-semibold text-zinc-950 dark:text-white">{entry.path}</p>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{entry.method} request</p>
          </section>

          <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-zinc-500">Request headers</p>
            <pre className="mt-3 overflow-x-auto rounded-2xl bg-zinc-950 p-4 text-xs text-zinc-100">
              {JSON.stringify(entry.request.headers, null, 2)}
            </pre>
          </section>
        </aside>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-zinc-500">Request body</p>
          <pre className="mt-3 overflow-x-auto rounded-2xl bg-zinc-950 p-4 text-xs text-zinc-100">{entry.request.body ?? 'No body'}</pre>
        </section>
        <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-zinc-500">Response body</p>
          <pre className="mt-3 overflow-x-auto rounded-2xl bg-zinc-950 p-4 text-xs text-zinc-100">{entry.response.body ?? 'No response content'}</pre>
        </section>
      </div>

      <div className="mt-8 flex items-center justify-between gap-3">
        <Link
          href="/history"
          className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:border-zinc-400 hover:text-zinc-950 dark:border-zinc-700 dark:text-zinc-200 dark:hover:text-white"
        >
          Back to history
        </Link>
        <Link
          href="/"
          className="rounded-full bg-zinc-950 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-300"
        >
          Go to editor
        </Link>
      </div>
    </main>
  );
}
