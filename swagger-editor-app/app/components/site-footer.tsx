import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-zinc-200 bg-white/80 dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-6 text-sm text-zinc-600 sm:flex-row sm:items-center sm:justify-between lg:px-8 dark:text-zinc-300">
        <p>Swagger Studio prototype for editing and testing OpenAPI-style requests.</p>
        <Link href="/about" className="font-medium text-zinc-950 transition hover:text-zinc-700 dark:text-white dark:hover:text-zinc-300">
          About
        </Link>
      </div>
    </footer>
  );
}
