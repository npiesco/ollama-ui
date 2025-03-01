// ollama-ui/src/app/layout.tsx
"use client"

import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { ServerControl } from "@/components/ServerControl";
import { Sidebar } from "@/components/Sidebar";
import { usePathname } from "next/navigation";
import { StoreProvider } from "@/components/providers/StoreProvider";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const isPopout = pathname === "/chat/popout";

  return (
    <html lang="en">
      <body className={inter.className}>
        <StoreProvider>
          <div className="flex h-screen">
            {!isPopout && <Sidebar />}
            <div className="flex-1 overflow-auto">
              {!isPopout && (
                <div className="flex justify-end p-4 border-b">
                  <ServerControl />
                </div>
              )}
              <main className={isPopout ? "h-full" : "p-6"}>
                {children}
              </main>
            </div>
          </div>
          <Toaster />
        </StoreProvider>
      </body>
    </html>
  );
}
