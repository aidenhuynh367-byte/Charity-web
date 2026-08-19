import type { Metadata } from "next";

import { I18nProvider } from "@/components/i18n-provider";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";

import "./globals.css";

export const metadata: Metadata = {
  title: "Charity & Contributors",
  description: "Sign in, choose your role, and complete your profile.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  return (
    <html lang={locale}>
      <body className="min-h-screen antialiased">
        <I18nProvider locale={locale} dict={dict}>
          <div className="pointer-events-none fixed left-4 top-4 z-50 text-sm font-medium text-slate-900">
            Made by Aiden Huynh
          </div>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
