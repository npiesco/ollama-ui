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
import { useEffect } from 'react';
import { toast } from 'sonner';

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

  useEffect(() => {
    const checkOllamaRunning = async () => {
      try {
        const response = await fetch('http://localhost:11434/api/version');
        if (!response.ok) {
          throw new Error('Ollama not running');
        }
      } catch (error) {
        toast.error('Ollama is not running. Attempting to start...');
        // Attempt to start Ollama
        try {
          const startResponse = await fetch('/api/server/start', { method: 'POST' });
          if (!startResponse.ok) {
            throw new Error('Failed to start Ollama');
          }
          toast.success('Ollama started successfully');
        } catch (startError) {
          toast.error('Failed to start Ollama. Please start it manually.');
        }
      }
    };

    checkOllamaRunning();
  }, []);

  return (
    <div className="container mx-auto p-1 space-y-2 h-[calc(100vh-4rem)]">
      <div className="flex flex-col space-y-2 max-w-4xl mx-auto">
        <div className="flex items-center justify-center gap-3">
          <Image
            src="/welcome-llama.svg"
            alt="Welcome Llama"
            width={60}
            height={60}
            className="dark:invert dark:brightness-90 float-animation"
          />
          <div className="text-center">
            <h1 className="text-3xl font-bold gradient-text mb-1">Welcome to Ollama UI</h1>
            <p className="text-base text-muted-foreground">
              Local AI Workbench
            </p>
          </div>
        </div>

        <NavigationMenu className="self-center">
          <NavigationMenuList className="flex flex-wrap gap-1.5 justify-center">
            <NavigationMenuItem className="relative">
              <NavigationMenuTrigger className="glass animated-border w-[160px] p-0 pr-3">
                <div className="flex items-center w-full">
                  <div className="px-3 py-1.5">
                    <Globe className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="flex-1 text-center text-primary font-medium text-sm">Offline-Centric</span>
                </div>
              </NavigationMenuTrigger>
              <NavigationMenuContent className="absolute left-0 top-full z-50">
                <ul className="p-3 w-[280px] rounded-xl glass shadow-lg">
                  <li>
                    <h3 className="text-sm font-semibold mb-1.5 gradient-text">Work Offline with Confidence</h3>
                    <p className="text-xs text-muted-foreground mb-2">
                      Run powerful AI models without constant internet connectivity. Once downloaded, your models work entirely offline.
                    </p>
                    <ul className="space-y-1.5 text-xs">
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary ring-2 ring-primary/30" />
                        <span className="text-primary font-medium">No internet required for inference</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary ring-2 ring-primary/30" />
                        <span className="text-primary font-medium">Download once, use anywhere</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary ring-2 ring-primary/30" />
                        <span className="text-primary font-medium">Perfect for air-gapped environments</span>
                      </li>
                    </ul>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem className="relative">
              <NavigationMenuTrigger className="glass animated-border w-[160px] p-0 pr-3">
                <div className="flex items-center w-full">
                  <div className="px-3 py-1.5">
                    <Cpu className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="flex-1 text-center text-primary font-medium text-sm">Local Hosting</span>
                </div>
              </NavigationMenuTrigger>
              <NavigationMenuContent className="absolute left-0 top-full z-50">
                <ul className="p-3 w-[280px] rounded-xl glass shadow-lg">
                  <li>
                    <h3 className="text-sm font-semibold mb-1.5 gradient-text">Your Machine, Your Rules</h3>
                    <p className="text-xs text-muted-foreground mb-2">
                      Host models directly on your hardware for maximum control and flexibility over your AI infrastructure.
                    </p>
                    <ul className="space-y-1.5 text-xs">
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary ring-2 ring-primary/30" />
                        <span className="text-primary font-medium">Full control over model deployment</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary ring-2 ring-primary/30" />
                        <span className="text-primary font-medium">Customize resource allocation</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary ring-2 ring-primary/30" />
                        <span className="text-primary font-medium">Zero latency to external services</span>
                      </li>
                    </ul>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem className="relative">
              <NavigationMenuTrigger className="glass animated-border w-[160px] p-0 pr-3">
                <div className="flex items-center w-full">
                  <div className="px-3 py-1.5">
                    <Shield className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="flex-1 text-center text-primary font-medium text-sm">Cloud Independent</span>
                </div>
              </NavigationMenuTrigger>
              <NavigationMenuContent className="absolute left-0 top-full z-50">
                <ul className="p-3 w-[280px] rounded-xl glass shadow-lg">
                  <li>
                    <h3 className="text-sm font-semibold mb-1.5 gradient-text">Break Free from the Cloud</h3>
                    <p className="text-xs text-muted-foreground mb-2">
                      Complete independence from cloud services and external APIs. No subscriptions or usage limits.
                    </p>
                    <ul className="space-y-1.5 text-xs">
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary ring-2 ring-primary/30" />
                        <span className="text-primary font-medium">No recurring costs</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary ring-2 ring-primary/30" />
                        <span className="text-primary font-medium">Unlimited inference</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary ring-2 ring-primary/30" />
                        <span className="text-primary font-medium">No API rate limits</span>
                      </li>
                    </ul>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem className="relative">
              <NavigationMenuTrigger className="glass animated-border w-[160px] p-0 pr-3">
                <div className="flex items-center w-full">
                  <div className="px-3 py-1.5">
                    <Lock className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="flex-1 text-center text-primary font-medium text-sm">Privacy-First</span>
                </div>
              </NavigationMenuTrigger>
              <NavigationMenuContent className="absolute left-0 top-full z-50">
                <ul className="p-3 w-[280px] rounded-xl glass shadow-lg">
                  <li>
                    <h3 className="text-sm font-semibold mb-1.5 gradient-text">Your Data Stays Private</h3>
                    <p className="text-xs text-muted-foreground mb-2">
                      Keep your data completely private and secure on your local system. No data ever leaves your machine.
                    </p>
                    <ul className="space-y-1.5 text-xs">
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary ring-2 ring-primary/30" />
                        <span className="text-primary font-medium">Complete data sovereignty</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary ring-2 ring-primary/30" />
                        <span className="text-primary font-medium">No cloud data transmission</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary ring-2 ring-primary/30" />
                        <span className="text-primary font-medium">Perfect for sensitive data</span>
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

      <div className="grid gap-2 md:grid-cols-2 max-w-6xl mx-auto">
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
                <CardHeader className="pb-0.5">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${
                      step.primary 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    } group-hover:scale-110 transition-transform`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <CardTitle className="text-lg">{step.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-0.5 py-0.5">
                  <CardDescription className="text-xs font-medium">
                    {step.description}
                  </CardDescription>
                  <p className="text-xs text-muted-foreground">
                    {step.details}
                  </p>
                </CardContent>
                <CardFooter className="pt-0.5">
                  <Button 
                    variant={step.primary ? "default" : "ghost"} 
                    className="ml-auto group/button text-xs h-7 px-2"
                  >
                    Get Started
                    <ArrowRight className="w-3 h-3 ml-1 group-hover/button:translate-x-1 transition-transform" />
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
