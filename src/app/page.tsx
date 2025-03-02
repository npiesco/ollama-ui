// /ollama-ui/src/app/page.tsx
"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, Download, Play, Settings } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function Home() {
  const router = useRouter()

  const quickStartSteps = [
    {
      title: "Install a Model",
      description: "Download and install your first AI model",
      icon: Download,
      href: "/models",
      primary: true
    },
    {
      title: "Start Chatting",
      description: "Begin a conversation with your AI model",
      icon: MessageSquare,
      href: "/chat"
    },
    {
      title: "View Running Models",
      description: "Monitor your active model instances",
      icon: Play,
      href: "/running-models"
    },
    {
      title: "Configure Settings",
      description: "Customize your Ollama UI experience",
      icon: Settings,
      href: "/settings"
    }
  ]

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="space-y-2">
        <div className="text-center flex items-center justify-center gap-4">
          <Image
            src="/welcome-llama.svg"
            alt="Welcome Llama"
            width={64}
            height={64}
            className="rounded-lg dark:invert dark:brightness-90"
          />
          <div>
            <h2 className="text-lg font-semibold">Welcome to Ollama UI</h2>
            <p className="text-gray-500 mt-2">
              To get started, you&apos;ll need to install a model first.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {quickStartSteps.map((step, index) => {
          const Icon = step.icon
          return (
            <Card 
              key={index}
              className={`transition-all duration-200 hover:shadow-md ${
                step.primary ? 'border-primary' : ''
              }`}
            >
              <Link href={step.href}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${
                      step.primary 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <CardTitle>{step.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {step.description}
                  </CardDescription>
                </CardContent>
              </Link>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Getting Started Guide</CardTitle>
          <CardDescription>
            Follow these steps to get up and running with Ollama
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">1. Install a Model</h3>
              <p className="text-muted-foreground">
                Start by pulling a model from the registry. We recommend starting with a smaller model like &quot;mistral&quot; for testing.
              </p>
              <Button 
                variant="outline" 
                onClick={() => router.push('/pull-model')}
              >
                Go to Model Installation
              </Button>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">2. Start a Chat</h3>
              <p className="text-muted-foreground">
                Once your model is installed, you can start chatting with it. The chat interface supports both text and, for compatible models, image inputs.
              </p>
              <Button 
                variant="outline"
                onClick={() => router.push('/chat')}
              >
                Open Chat
              </Button>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">3. Explore Features</h3>
              <p className="text-muted-foreground">
                Discover additional features like model management, embeddings generation, and more through the sidebar navigation.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
