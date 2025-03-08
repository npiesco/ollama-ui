// ollama-ui/src/app/layout.tsx
import { Inter } from "next/font/google";
import "./globals.css";
import { ClientLayout } from "@/components/ClientLayout";
import type { Metadata, Viewport } from "next";
import { ServiceWorkerManager } from "@/lib/service-worker";
import { initWasm } from "@/lib/wasm/offline-inference";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ollama UI",
  description: "A modern UI for Ollama - Local AI Workbench",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Ollama UI",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#0A0C10",
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  viewportFit: "cover",
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
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Ollama UI" />
        <link rel="apple-touch-icon" href="/llama.svg" />
      </head>
      <body className={inter.className}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
