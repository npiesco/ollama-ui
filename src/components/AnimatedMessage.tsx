// /ollama-ui/src/components/AnimatedMessage.tsx
"use client"

import type React from "react"

import { motion } from "framer-motion"

interface AnimatedMessageProps {
  children: React.ReactNode
  isUser: boolean
}

export function AnimatedMessage({ children, isUser }: AnimatedMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`mb-2 ${isUser ? "text-right" : "text-left"}`}
    >
      <span className={`inline-block p-2 rounded-lg ${isUser ? "bg-blue-500 text-white" : "bg-gray-200"}`}>
        {children}
      </span>
    </motion.div>
  )
}

