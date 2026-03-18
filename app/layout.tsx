// Root layout for the app router (sets global HTML shell and imports global styles).

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ClearDoc",
  description: "Upload a confusing document and get a calm, plain-English explanation."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-white text-slate-900">{children}</body>
    </html>
  );
}

