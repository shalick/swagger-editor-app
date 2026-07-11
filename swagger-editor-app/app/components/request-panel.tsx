"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useAuth } from "./auth-provider";
import { detectFormat, getDefaultSpec, parseSpec, stringifySpec, type SpecFormat } from "../lib/swagger-editor";

const DEFAULT_URL = "https://jsonplaceholder.typicode.com/todos/1";
const STORAGE_KEY_PREFIX = "swagger-studio-saved-spec";

export function RequestPanel() {
  const { authState } = useAuth();
  const [url, setUrl] = useState(DEFAULT_URL);
  const [method, setMethod] = useState("GET");
  const [responseText, setResponseText] = useState("Select a request and submit it to preview the response.");
  const [isLoading, setIsLoading] = useState(false);
  const [specText, setSpecText] = useState(getDefaultSpec("yaml"));
  const [format, setFormat] = useState<SpecFormat>("yaml");
  const [detectedFormat, setDetectedFormat] = useState<SpecFormat>("yaml");
  const [saveStatus, setSaveStatus] = useState("Ready to import or paste a schema.");
  const [isPortrait, setIsPortrait] = useState(false);

  const parsedSpec = useMemo(() => parseSpec(specText), [specText]);
  const hasValidSpec = !parsedSpec.error && Boolean(parsedSpec.value);

  useEffect(() => {
    setDetectedFormat(detectFormat(specText));
  }, [specText]);

  useEffect(() => {
    if (!authState.isAuthenticated || !authState.token) {
      return;
    }

    try {
      const raw = window.localStorage.getItem(`${STORAGE_KEY_PREFIX}:${authState.token}`);
      if (!raw) {
        return;
      }

      const stored = JSON.parse(raw) as { text?: string; format?: SpecFormat };
      if (stored.text) {
        setSpecText(stored.text);
        setFormat(stored.format === "json" ? "json" : "yaml");
        setDetectedFormat(detectFormat(stored.text));
        setSaveStatus("Restored your last saved schema.");
      }
    } catch {
      setSaveStatus("Unable to restore the saved schema.");
    }
  }, [authState.isAuthenticated, authState.token]);

  useEffect(() => {
    function updateOrientation() {
      setIsPortrait(window.innerHeight > window.innerWidth);
    }

    updateOrientation();
    window.addEventListener("resize", updateOrientation);
    return () => window.removeEventListener("resize", updateOrientation);
  }, []);

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

  function handleSpecChange(nextText: string) {
    setSpecText(nextText);
    setDetectedFormat(detectFormat(nextText));
    setSaveStatus(nextText.trim() ? "Schema updated. Validate and preview the endpoints." : "Paste or import a schema to begin.");
  }

  function handleFormatSwitch() {
    const nextFormat: SpecFormat = format === "json" ? "yaml" : "json";

    if (!specText.trim()) {
      setSpecText(getDefaultSpec(nextFormat));
      setFormat(nextFormat);
      setDetectedFormat(nextFormat);
      setSaveStatus(`Switched to ${nextFormat.toUpperCase()} mode.`);
      return;
    }

    if (parsedSpec.value) {
      setSpecText(stringifySpec(parsedSpec.value, nextFormat));
      setFormat(nextFormat);
      setDetectedFormat(nextFormat);
      setSaveStatus(`Switched to ${nextFormat.toUpperCase()} mode.`);
      return;
    }

    setFormat(nextFormat);
    setDetectedFormat(nextFormat);
    setSaveStatus("The current schema could not be converted until it is valid.");
  }

  function handleSave() {
    if (!authState.isAuthenticated || !authState.token) {
      setSaveStatus("Sign in to save schemas for later.");
      return;
    }

    try {
      const payload = JSON.stringify({ text: specText, format });
      window.localStorage.setItem(`${STORAGE_KEY_PREFIX}:${authState.token}`, payload);
      setSaveStatus("Schema saved for this account.");
    } catch {
      setSaveStatus("Saving failed. Please try again.");
    }
  }

  return (
    <div className="space-y-6">
      <div className={`grid gap-6 ${isPortrait ? "grid-cols-1" : "lg:grid-cols-[1.1fr_0.9fr]"}`}>
        <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center justify-between gap-3">
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
      </div>

      <div className={`grid gap-6 ${isPortrait ? "grid-cols-1" : "lg:grid-cols-[1.1fr_0.9fr]"}`}>
        <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-zinc-500">Swagger Editor</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight">Paste, edit, and validate OpenAPI specs</h3>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-zinc-300 px-3 py-1 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">
                Auto-detect: {detectedFormat.toUpperCase()}
              </span>
              <button
                type="button"
                onClick={handleFormatSwitch}
                className="rounded-full border border-zinc-300 px-3 py-1 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-950 dark:border-zinc-700 dark:text-zinc-200 dark:hover:text-white"
              >
                Switch to {format === "json" ? "YAML" : "JSON"}
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!authState.isAuthenticated}
                className="rounded-full bg-zinc-950 px-3 py-1 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-300"
              >
                Save
              </button>
            </div>
          </div>

          <label className="mt-6 block text-sm font-medium text-zinc-700 dark:text-zinc-200" htmlFor="swagger-editor">
            Specification
          </label>
          <textarea
            id="swagger-editor"
            value={specText}
            onChange={(event) => handleSpecChange(event.target.value)}
            spellCheck={false}
            className="mt-3 min-h-[280px] w-full rounded-2xl border border-zinc-300 bg-zinc-950 p-4 font-mono text-sm text-zinc-100 outline-none focus:border-zinc-600 dark:border-zinc-700"
            placeholder="Paste a Swagger or OpenAPI document here..."
          />

          <div className="mt-3 flex items-center justify-between text-sm text-zinc-600 dark:text-zinc-300">
            <span>{saveStatus}</span>
            <span>{hasValidSpec ? "Viewer is synced" : "Waiting for a valid schema"}</span>
          </div>

          {parsedSpec.error ? (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
              {parsedSpec.error}
            </div>
          ) : null}
        </section>

        <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-zinc-500">Viewer</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight">Endpoints</h3>
            </div>
            <span className="rounded-full border border-zinc-300 px-3 py-1 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">
              {parsedSpec.endpoints.length} endpoints
            </span>
          </div>

          {hasValidSpec ? (
            <ul className="mt-6 space-y-3">
              {parsedSpec.endpoints.map((endpoint) => (
                <li key={`${endpoint.method}-${endpoint.path}`} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/70">
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full bg-zinc-950 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white dark:bg-zinc-100 dark:text-zinc-950">
                      {endpoint.method}
                    </span>
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">{endpoint.path}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-zinc-300 p-6 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">
              {parsedSpec.error
                ? "Fix the schema errors above to populate the viewer."
                : "Paste a valid OpenAPI or Swagger document to see its endpoints here."}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
