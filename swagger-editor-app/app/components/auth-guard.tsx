"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "./auth-provider";
import { useToast } from "./toast-provider";
import { useI18n } from "./i18n-provider";

const PUBLIC_PATHS = ["/", "/about", "/signin", "/signup"];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { authState, isReady } = useAuth();
  const { addToast } = useToast();
  const { t } = useI18n();

  useEffect(() => {
    if (!isReady) {
      return;
    }

    const isPublicPath = PUBLIC_PATHS.includes(pathname);
    if (!authState.isAuthenticated && !isPublicPath) {
      addToast(t("errors.unauthorized", "You are not authorized to access this resource."), "error");
      router.replace("/");
    }
  }, [authState.isAuthenticated, isReady, pathname, router, addToast, t]);

  if (!isReady) {
    return null;
  }

  return <>{children}</>;
}
