"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type AuthState = {
  token: string | null;
  expiresAt: number | null;
  isAuthenticated: boolean;
};

type AuthContextValue = {
  authState: AuthState;
  isReady: boolean;
  signIn: (token: string) => void;
  signOut: () => void;
};

const STORAGE_KEY = "swagger-studio-auth";
const TOKEN_TTL_MS = 1000 * 60 * 60 * 8;

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readStoredAuth(): AuthState {
  if (typeof window === "undefined") {
    return { token: null, expiresAt: null, isAuthenticated: false };
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return { token: null, expiresAt: null, isAuthenticated: false };
  }

  try {
    const parsed = JSON.parse(raw) as AuthState;
    if (parsed.token && parsed.expiresAt && parsed.expiresAt > Date.now()) {
      return { token: parsed.token, expiresAt: parsed.expiresAt, isAuthenticated: true };
    }
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
  }

  return { token: null, expiresAt: null, isAuthenticated: false };
}

function persistAuth(authState: AuthState) {
  if (typeof window === "undefined") {
    return;
  }

  if (authState.isAuthenticated && authState.token && authState.expiresAt) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(authState));
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    token: null,
    expiresAt: null,
    isAuthenticated: false,
  });
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const stored = readStoredAuth();
    setAuthState(stored);
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    if (authState.isAuthenticated && authState.expiresAt && authState.expiresAt <= Date.now()) {
      setAuthState({ token: null, expiresAt: null, isAuthenticated: false });
      persistAuth({ token: null, expiresAt: null, isAuthenticated: false });
    }
  }, [authState, isReady]);

  const signIn = useCallback((token: string) => {
    const nextState = {
      token,
      expiresAt: Date.now() + TOKEN_TTL_MS,
      isAuthenticated: true,
    };

    setAuthState(nextState);
    persistAuth(nextState);
  }, []);

  const signOut = useCallback(() => {
    const nextState = { token: null, expiresAt: null, isAuthenticated: false };
    setAuthState(nextState);
    persistAuth(nextState);
  }, []);

  const value = useMemo(
    () => ({ authState, isReady, signIn, signOut }),
    [authState, isReady, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }

  return context;
}
