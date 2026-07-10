"use client";

import { FormEvent, useMemo, useState } from "react";

const EXAMPLE_SPEC = `openapi: 3.0.3
info:
  title: Sample API
  version: 1.0.0
paths:
  /pets:
    get:
      summary: List pets
      responses:
        '200':
          description: Success`;

const DEFAULT_URL = "https://jsonplaceholder.typicode.com/todos/1";

export function RequestPanel() {
  const [url, setUrl] = useState(DEFAULT_URL);
  const [method, setMethod] = useState("GET");
  const [responseText, setResponseText] = useState("Select a request and submit it to preview the response.");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setResponseText("Sending request...");

    try {
      const result = await fetch(`/api/proxy?target=${encodeURIComponent(url)}`);
      const body = await result.text();
      setResponseText(body || `Status ${result.status}`);
    } catch {
      setResponseText("The request failed. Check the target URL and try again.");
    } finally {
      setIsLoading(false);
    }
  }

  const specPreview = useMemo(() => EXAMPLE_SPEC, []);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-zinc-500">Request Builder</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">Try an API call</h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="flex gap-3">
            <select
              value={method}
              onChange={(event) => setMethod(event.target.value)}
              className="rounded-2xl border border-zinc-300 bg-white px-3 py-3 text-sm font-medium dark:border-zinc-700 dark:bg-zinc-900"
            >
              <option>GET</option>
              <option>POST</option>
              <option>PUT</option>
              <option>DELETE</option>
            </select>
            <input
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              className="flex-1 rounded-2xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-zinc-600 dark:border-zinc-700 dark:bg-zinc-900"
              placeholder="https://api.example.com/endpoint"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-2xl bg-zinc-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-300"
          >
            {isLoading ? "Sending..." : "Send request"}
          </button>
        </form>
      </section>

      <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-zinc-500">Response</p>
        <pre className="mt-4 overflow-x-auto rounded-2xl bg-zinc-950 p-4 text-sm text-zinc-100">
          {responseText}
        </pre>
      </section>

      <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 lg:col-span-2">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-zinc-500">OpenAPI Preview</p>
        <pre className="mt-4 overflow-x-auto rounded-2xl bg-zinc-950 p-4 text-sm text-zinc-100">
          {specPreview}
        </pre>
      </section>
    </div>
  );
}
