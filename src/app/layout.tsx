// ollama-ui/src/app/layout.tsx
import { Inter } from "next/font/google";
import "./globals.css";
import { ClientLayout } from "@/components/ClientLayout";
import type { Metadata, Viewport } from "next";
import { ServiceWorkerManager } from "@/lib/service-worker";
import { initWasm } from "@/lib/wasm/offline-inference";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

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
  themeColor: '#000000',
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "application-name": "Ollama UI",
    "apple-mobile-web-app-title": "Ollama UI",
    "msapplication-starturl": "/",
    "msapplication-TileColor": "#000000",
  },
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
        <meta name="viewport" content={viewport.width + ',' + viewport.initialScale + ',' + viewport.maximumScale + ',' + viewport.userScalable + ',' + viewport.viewportFit} />
      </head>
      <body className={inter.className}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
