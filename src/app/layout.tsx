// ollama-ui/src/app/layout.tsx
import { Inter as FontSans } from "next/font/google";
import "./globals.css";
import { ClientLayout } from "@/components/ClientLayout";
import type { Metadata } from "next";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Ollama UI",
  description: "A modern UI for Ollama",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${fontSans.variable} font-sans`}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
