import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Charity & Contributors",
  description: "Sign in, choose your role, and complete your profile.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
