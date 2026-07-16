"use client";

export default function Error({ error }: { error: Error }) {
  console.error(error);
  return (
    <main className="mx-auto min-h-[70vh] max-w-4xl px-6 py-20">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="mt-4 text-zinc-600">An unexpected error occurred. Try refreshing the page.</p>
    </main>
  );
}
