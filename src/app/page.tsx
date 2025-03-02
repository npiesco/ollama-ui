// /ollama-ui/src/app/page.tsx
"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { MessageSquare, Download, Play, Settings, ArrowRight, Shield, Cpu, Globe, Lock } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { OllamaInstaller } from "@/components/OllamaInstaller"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"

export default function Home() {
  const quickStartSteps = [
    {
      title: "Install a Model",
      description: "Download and install your first AI model",
      details: "Get started with popular models like Llama 2, DeepSeek R1, or Mistral. Choose the right one for your needs.",
      icon: Download,
      href: "/models",
      primary: true
    },
    {
      title: "Start Chatting",
      description: "Begin a conversation with your AI model",
      details: "Engage in natural conversations with state-of-the-art language models. Ask questions, get creative, or solve problems together.",
      icon: MessageSquare,
      href: "/chat"
    },
    {
      title: "View Running Models",
      description: "Monitor your active model instances",
      details: "Keep track of your running models, manage resources, and ensure optimal performance of your AI assistants.",
      icon: Play,
      href: "/running-models"
    },
    {
      title: "Configure Settings",
      description: "Customize your Ollama UI experience",
      details: "Personalize your experience with custom parameters, model configurations, and interface preferences.",
      icon: Settings,
      href: "/settings"
    }
  ]

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-center gap-8 py-1">
          <Image
            src="/welcome-llama.svg"
            alt="Welcome Llama"
            width={100}
            height={100}
            className="dark:invert dark:brightness-90 float-animation"
          />
          <div className="text-center">
            <h1 className="text-5xl font-bold gradient-text mb-3">Welcome to Ollama UI</h1>
            <p className="text-xl text-muted-foreground">
              Local AI Workbench
            </p>
          </div>
        </div>

        <NavigationMenu className="self-center">
          <NavigationMenuList className="flex gap-3">
            <NavigationMenuItem className="relative">
              <NavigationMenuTrigger className="glass animated-border w-[220px] p-0 pr-4">
                <div className="flex items-center w-full">
                  <div className="px-4 py-2">
                    <Globe className="w-4 h-4" />
                  </div>
                  <span className="flex-1 text-center">Offline-Centric</span>
                </div>
              </NavigationMenuTrigger>
              <NavigationMenuContent className="absolute left-0 top-full z-50">
                <ul className="p-6 w-[400px] rounded-xl glass shadow-lg">
                  <li>
                    <h3 className="text-lg font-semibold mb-3 gradient-text">Work Offline with Confidence</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Run powerful AI models without constant internet connectivity. Once downloaded, your models work entirely offline.
                    </p>
                    <ul className="space-y-3 text-sm">
                      <li className="flex items-center gap-3">
                        <span className="bg-primary/10 text-primary p-1.5 rounded-full" />
                        No internet required for inference
                      </li>
                      <li className="flex items-center gap-3">
                        <span className="bg-secondary/10 text-secondary p-1.5 rounded-full" />
                        Download once, use anywhere
                      </li>
                      <li className="flex items-center gap-3">
                        <span className="bg-accent/10 text-accent p-1.5 rounded-full" />
                        Perfect for air-gapped environments
                      </li>
                    </ul>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem className="relative">
              <NavigationMenuTrigger className="glass animated-border w-[220px] p-0 pr-4">
                <div className="flex items-center w-full">
                  <div className="px-4 py-2">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <span className="flex-1 text-center">Local Hosting</span>
                </div>
              </NavigationMenuTrigger>
              <NavigationMenuContent className="absolute left-0 top-full z-50">
                <ul className="p-6 w-[400px] rounded-xl glass shadow-lg">
                  <li>
                    <h3 className="text-lg font-semibold mb-3 gradient-text">Your Machine, Your Rules</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Host models directly on your hardware for maximum control and flexibility over your AI infrastructure.
                    </p>
                    <ul className="space-y-3 text-sm">
                      <li className="flex items-center gap-3">
                        <span className="bg-primary/10 text-primary p-1.5 rounded-full" />
                        Full control over model deployment
                      </li>
                      <li className="flex items-center gap-3">
                        <span className="bg-secondary/10 text-secondary p-1.5 rounded-full" />
                        Customize resource allocation
                      </li>
                      <li className="flex items-center gap-3">
                        <span className="bg-accent/10 text-accent p-1.5 rounded-full" />
                        Zero latency to external services
                      </li>
                    </ul>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem className="relative">
              <NavigationMenuTrigger className="glass animated-border w-[220px] p-0 pr-4">
                <div className="flex items-center w-full">
                  <div className="px-4 py-2">
                    <Shield className="w-4 h-4" />
                  </div>
                  <span className="flex-1 text-center">Cloud Independent</span>
                </div>
              </NavigationMenuTrigger>
              <NavigationMenuContent className="absolute left-0 top-full z-50">
                <ul className="p-6 w-[400px] rounded-xl glass shadow-lg">
                  <li>
                    <h3 className="text-lg font-semibold mb-3 gradient-text">Break Free from the Cloud</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Complete independence from cloud services and external APIs. No subscriptions or usage limits.
                    </p>
                    <ul className="space-y-3 text-sm">
                      <li className="flex items-center gap-3">
                        <span className="bg-primary/10 text-primary p-1.5 rounded-full" />
                        No recurring costs
                      </li>
                      <li className="flex items-center gap-3">
                        <span className="bg-secondary/10 text-secondary p-1.5 rounded-full" />
                        Unlimited inference
                      </li>
                      <li className="flex items-center gap-3">
                        <span className="bg-accent/10 text-accent p-1.5 rounded-full" />
                        No API rate limits
                      </li>
                    </ul>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem className="relative">
              <NavigationMenuTrigger className="glass animated-border w-[220px] p-0 pr-4">
                <div className="flex items-center w-full">
                  <div className="px-4 py-2">
                    <Lock className="w-4 h-4" />
                  </div>
                  <span className="flex-1 text-center">Privacy-First</span>
                </div>
              </NavigationMenuTrigger>
              <NavigationMenuContent className="absolute left-0 top-full z-50">
                <ul className="p-6 w-[400px] rounded-xl glass shadow-lg">
                  <li>
                    <h3 className="text-lg font-semibold mb-3 gradient-text">Your Data Stays Private</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Keep your data completely private and secure on your local system. No data ever leaves your machine.
                    </p>
                    <ul className="space-y-3 text-sm">
                      <li className="flex items-center gap-3">
                        <span className="bg-primary/10 text-primary p-1.5 rounded-full" />
                        Complete data sovereignty
                      </li>
                      <li className="flex items-center gap-3">
                        <span className="bg-secondary/10 text-secondary p-1.5 rounded-full" />
                        No cloud data transmission
                      </li>
                      <li className="flex items-center gap-3">
                        <span className="bg-accent/10 text-accent p-1.5 rounded-full" />
                        Perfect for sensitive data
                      </li>
                    </ul>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      <OllamaInstaller />

      <div className="grid gap-6 md:grid-cols-2 max-w-6xl mx-auto">
        {quickStartSteps.map((step, index) => {
          const Icon = step.icon
          return (
            <Link 
              key={index} 
              href={step.href}
              className="group"
            >
              <Card className={`h-full card-hover ${
                step.primary ? 'animated-border' : ''
              }`}>
                <CardHeader className="pb-1">
                  <div className="flex items-center gap-4">
                    <div className={`p-3.5 rounded-xl ${
                      step.primary 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    } group-hover:scale-110 transition-transform`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-2xl">{step.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-1 py-1.5">
                  <CardDescription className="text-base font-medium mb-1">
                    {step.description}
                  </CardDescription>
                  <p className="text-sm text-muted-foreground">
                    {step.details}
                  </p>
                </CardContent>
                <CardFooter className="pt-1">
                  <Button 
                    variant={step.primary ? "default" : "ghost"} 
                    className="ml-auto group/button"
                  >
                    Get Started
                    <ArrowRight className="w-4 h-4 ml-2 group-hover/button:translate-x-1 transition-transform" />
                  </Button>
                </CardFooter>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
