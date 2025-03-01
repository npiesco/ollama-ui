// /ollama-ui/src/app/chat/popout/page.tsx
"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Chat } from "@/components/Chat"

export default function PopoutChat() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to main chat if not a pop-out window
    if (!window.opener) {
      router.push('/chat')
    }
  }, [router])

  return (
    <div className="h-full">
      <Chat isPopped={true} />
    </div>
  )
}