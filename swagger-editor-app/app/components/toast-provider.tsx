"use client";

import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

export type Toast = {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
};

type ToastContextValue = {
  toasts: Toast[];
  addToast: (message: string, type?: ToastType, duration?: number) => string;
  removeToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

let toastId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const timersRef = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      // clear pending timers
      for (const t of timersRef.current.values()) {
        clearTimeout(t as unknown as number);
      }
      timersRef.current.clear();
    };
  }, []);

  const removeToast = useCallback((id: string) => {
    // clear any timer associated with this toast
    const t = timersRef.current.get(id);
    if (t) {
      clearTimeout(t as unknown as number);
      timersRef.current.delete(id);
    }
    if (!mountedRef.current) return;
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, type: ToastType = "info", duration = 5000): string => {
      const id = String(toastId++);
      const toast: Toast = { id, message, type, duration };

      setToasts((prev) => [...prev, toast]);

      if (duration > 0) {
        const timer = setTimeout(() => {
          // only call remove if still mounted
          if (mountedRef.current) removeToast(id);
        }, duration);
        timersRef.current.set(id, timer);
      }

      return id;
    },
    [removeToast],
  );

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
