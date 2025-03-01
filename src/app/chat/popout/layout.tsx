// /ollama-ui/src/app/chat/popout/layout.tsx
"use client"

import { Toaster } from "sonner";
import "../../globals.css";

export default function PopoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-screen bg-background">
      {children}
      <Toaster />
    </div>
  )
} 