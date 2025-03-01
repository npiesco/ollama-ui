"use client"

import { Toaster } from "sonner"
import { ServerControl } from "@/components/ServerControl"
import { Sidebar } from "@/components/Sidebar"
import { usePathname } from "next/navigation"
import { StoreProvider } from "@/components/providers/StoreProvider"
import { ThemeProvider } from "@/components/theme-provider"

interface ClientLayoutProps {
  children: React.ReactNode
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname()
  const isPopout = pathname === "/chat/popout"

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
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
    </ThemeProvider>
  )
} 