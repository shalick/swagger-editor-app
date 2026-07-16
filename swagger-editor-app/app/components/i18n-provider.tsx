"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { translations, Language } from "../lib/translations";

type I18nContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, defaultValue?: string) => string;
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = "swagger-studio-language";

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored === "en" || stored === "ru") {
      setLanguageState(stored);
    } else {
      setLanguageState(window.navigator.language.startsWith("ru") ? "ru" : "en");
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    }
  };

  const t = (key: string, defaultValue?: string): string => {
    const keys = key.split(".");
    let value: unknown = translations[language];

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        return defaultValue || key;
      }
    }

    return typeof value === "string" ? value : defaultValue || key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return context;
}
