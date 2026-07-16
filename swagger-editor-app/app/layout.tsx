import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "./components/auth-provider";
import { AuthGuard } from "./components/auth-guard";
import { SiteHeader } from "./components/site-header";
import { SiteFooter } from "./components/site-footer";
import { I18nProvider } from "./components/i18n-provider";
import { ToastProvider } from "./components/toast-provider";
import { ToastContainer } from "./components/toast-container";
import { ErrorBoundary } from "./components/error-boundary";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Swagger Studio",
  description: "A prototype OpenAPI editor and REST client shell",
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-zinc-50 text-zinc-950 dark:bg-black dark:text-zinc-50">
        <I18nProvider>
          <AuthProvider>
            <ToastProvider>
              <ErrorBoundary>
                <SiteHeader />
                <AuthGuard>{children}</AuthGuard>
                <SiteFooter />
                <ToastContainer />
              </ErrorBoundary>
            </ToastProvider>
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
