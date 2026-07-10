"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "./auth-provider";

const PUBLIC_PATHS = ["/", "/about", "/signin", "/signup"];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { authState, isReady } = useAuth();

  useEffect(() => {
    if (!isReady) {
      return;
    }

    const isPublicPath = PUBLIC_PATHS.includes(pathname);
    if (!authState.isAuthenticated && !isPublicPath) {
      router.replace("/");
    }
  }, [authState.isAuthenticated, isReady, pathname, router]);

  if (!isReady) {
    return null;
  }

  return <>{children}</>;
}
