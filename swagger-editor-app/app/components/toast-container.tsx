"use client";

import { useToast } from "./toast-provider";

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex max-w-sm flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center justify-between gap-4 rounded-lg px-4 py-3 text-sm font-medium shadow-lg transition-all duration-300 ${getToastStyles(
            toast.type
          )}`}
        >
          <span>{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="opacity-70 hover:opacity-100 transition-opacity"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}

function getToastStyles(type: string): string {
  switch (type) {
    case "error":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100";
    case "success":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
    case "warning":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100";
    case "info":
    default:
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100";
  }
}
