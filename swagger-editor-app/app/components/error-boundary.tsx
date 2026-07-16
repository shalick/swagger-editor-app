"use client";

import { useEffect } from "react";
import { useToast } from "./toast-provider";
import { useI18n } from "./i18n-provider";

export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  const { addToast } = useToast();
  const { t } = useI18n();

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error("Uncaught error:", event.error);
      addToast(t("errors.genericError", "An error occurred"), "error");
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error("Unhandled promise rejection:", event.reason);
      addToast(t("errors.genericError", "An error occurred"), "error");
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, [addToast, t]);

  return <>{children}</>;
}
