// ollama-ui/src/app/layout.tsx
import { Inter } from "next/font/google";
import "./globals.css";
import { ClientLayout } from "@/components/ClientLayout";
import type { Metadata } from "next";
import { ServiceWorkerManager } from "@/lib/service-worker";
import { initWasm } from "@/lib/wasm/offline-inference";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ollama UI",
  description: "A modern UI for Ollama",
  manifest: "/manifest.json",
};

// Initialize service worker and WASM
if (typeof window !== 'undefined') {
  try {
    // Register service worker
    ServiceWorkerManager.getInstance().register().catch(console.error);

    // Initialize WASM
    const initWasmPromise = initWasm();
    if (initWasmPromise && typeof initWasmPromise.then === 'function') {
      initWasmPromise.catch(console.error);
    }
  } catch (error) {
    console.error('Failed to initialize offline features:', error);
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
