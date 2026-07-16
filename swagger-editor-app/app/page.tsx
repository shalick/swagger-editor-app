import { RequestPanel } from "./components/request-panel";

export default function Home() {
  return (
    <main className="flex-1 px-6 py-10 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="rounded-[2rem] border border-zinc-200 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800 p-8 text-white shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-zinc-400">OpenAPI shell</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Edit specs, inspect endpoints, and test requests in one accessible workspace.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-300">
            This prototype demonstrates a polished Swagger-style interface with auth-aware navigation and a built-in REST client experience.
          </p>
        </section>

        <RequestPanel />
      </div>
    </main>
  );
}
