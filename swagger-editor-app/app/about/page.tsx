export default function AboutPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-4xl flex-col justify-center px-6 py-20 lg:px-8">
      <p className="mb-4 text-sm font-semibold uppercase tracking-[0.35em] text-zinc-500">
        About Swagger Studio
      </p>
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
        Build, inspect, and test APIs from one polished workspace.
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-300">
        This prototype brings together an OpenAPI-focused editor experience with a simple REST client shell so you can move from spec ideas to request testing without leaving the app.
      </p>
    </main>
  );
}
