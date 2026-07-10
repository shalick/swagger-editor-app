"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useAuth } from "../components/auth-provider";

export default function SignInPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [value, setValue] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = value.trim() || "demo-token";
    signIn(token);
    router.push("/");
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-xl flex-col justify-center px-6 py-20 lg:px-8">
      <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-zinc-500">Sign in</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Access your API workspace</h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-300">
          Use any token value to simulate a signed-in session for this prototype.
        </p>
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200" htmlFor="token">
            API token
          </label>
          <input
            id="token"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="Enter token"
            className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-sm outline-none ring-0 focus:border-zinc-600 dark:border-zinc-700 dark:bg-zinc-900"
          />
          <button
            type="submit"
            className="w-full rounded-2xl bg-zinc-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-300"
          >
            Continue
          </button>
        </form>
        <p className="mt-6 text-sm text-zinc-600 dark:text-zinc-300">
          Need an account? <Link href="/signup" className="font-semibold text-zinc-950 dark:text-white">Create one</Link>
        </p>
      </div>
    </main>
  );
}
