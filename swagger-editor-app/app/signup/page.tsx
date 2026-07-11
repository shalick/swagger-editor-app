"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "../components/auth-provider";
import { getValidationErrors } from "../lib/auth-validation";

export default function SignUpPage() {
  const router = useRouter();
  const { authState, signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string }>({});

  useEffect(() => {
    if (authState.isAuthenticated) {
      router.replace("/");
    }
  }, [authState.isAuthenticated, router]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationErrors = getValidationErrors({ email, password, confirmPassword });
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    signIn(`${email}:${password}`);
    router.push("/");
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-xl flex-col justify-center px-6 py-20 lg:px-8">
      <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-zinc-500">Sign up</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Create your account</h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-300">
          Sign up here to save your testing flow and future requests.
        </p>
        <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setErrors((current) => ({ ...current, email: undefined }));
              }}
              placeholder="you@example.com"
              className="mt-2 w-full rounded-2xl border border-zinc-300 px-4 py-3 text-sm outline-none ring-0 focus:border-zinc-600 dark:border-zinc-700 dark:bg-zinc-900"
            />
            {errors.email ? <p className="mt-2 text-sm text-red-600">{errors.email}</p> : null}
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setErrors((current) => ({ ...current, password: undefined, confirmPassword: undefined }));
              }}
              placeholder="••••••••"
              className="mt-2 w-full rounded-2xl border border-zinc-300 px-4 py-3 text-sm outline-none ring-0 focus:border-zinc-600 dark:border-zinc-700 dark:bg-zinc-900"
            />
            {errors.password ? <p className="mt-2 text-sm text-red-600">{errors.password}</p> : null}
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200" htmlFor="confirm-password">
              Confirm Password
            </label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(event) => {
                setConfirmPassword(event.target.value);
                setErrors((current) => ({ ...current, confirmPassword: undefined }));
              }}
              placeholder="••••••••"
              className="mt-2 w-full rounded-2xl border border-zinc-300 px-4 py-3 text-sm outline-none ring-0 focus:border-zinc-600 dark:border-zinc-700 dark:bg-zinc-900"
            />
            {errors.confirmPassword ? <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p> : null}
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-zinc-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-300"
          >
            Create account
          </button>
        </form>
        <p className="mt-6 text-sm text-zinc-600 dark:text-zinc-300">
          Already have an account? <Link href="/signin" className="font-semibold text-zinc-950 dark:text-white">Sign in</Link>
        </p>
      </div>
    </main>
  );
}
