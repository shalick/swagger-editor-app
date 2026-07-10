export default function HistoryPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-4xl flex-col justify-center px-6 py-20 lg:px-8">
      <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-zinc-500">History</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Recent requests</h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-300">
          This view is ready for persisted request history once a real backend is connected.
        </p>
      </div>
    </main>
  );
}
