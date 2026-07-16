"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./auth-provider";
import { useI18n } from "./i18n-provider";
import { useEffect, useState } from "react";

export function SiteHeader() {
  const pathname = usePathname();
  const { authState, signOut } = useAuth();
  const { language, setLanguage, t } = useI18n();
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsSticky(scrollPosition > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const links = [
    { href: "/", label: t("common.editor", "Editor") },
    { href: "/about", label: t("common.about", "About") },
  ];

  return (
    <header
      className={`sticky top-0 z-40 border-b border-zinc-200 bg-white/90 backdrop-blur transition-all duration-300 dark:border-zinc-800 dark:bg-zinc-950/90 ${
        isSticky ? "shadow-md" : ""
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            {t("header.title", "Swagger Studio")}
          </Link>
          <nav className="hidden gap-4 text-sm text-zinc-600 md:flex dark:text-zinc-300">
            {links.map((link) => {
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={isActive ? "font-semibold text-zinc-950 dark:text-white" : "hover:text-zinc-950 dark:hover:text-white"}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <div className="flex items-center gap-2 rounded-full border border-zinc-300 dark:border-zinc-700 px-2 py-1">
            <button
              onClick={() => setLanguage("en")}
              className={`px-2 py-1 text-sm transition ${
                language === "en"
                  ? "font-semibold text-zinc-950 dark:text-white"
                  : "text-zinc-600 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white"
              }`}
            >
              EN
            </button>
            <span className="text-zinc-300 dark:text-zinc-700">|</span>
            <button
              onClick={() => setLanguage("ru")}
              className={`px-2 py-1 text-sm transition ${
                language === "ru"
                  ? "font-semibold text-zinc-950 dark:text-white"
                  : "text-zinc-600 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white"
              }`}
            >
              РУ
            </button>
          </div>

          {authState.isAuthenticated ? (
            <>
              <Link
                href="/history"
                className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-950 dark:border-zinc-700 dark:text-zinc-200 dark:hover:text-white"
              >
                {t("common.history", "History")}
              </Link>
              <button
                type="button"
                onClick={signOut}
                className="rounded-full bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-300"
              >
                {t("common.signOut", "Sign Out")}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/signin"
                className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-950 dark:border-zinc-700 dark:text-zinc-200 dark:hover:text-white"
              >
                {t("common.signIn", "Sign In")}
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-300"
              >
                {t("common.signUp", "Sign Up")}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
