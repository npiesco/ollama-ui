"use client"

import { useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X } from "lucide-react"

const installationInstructions = {
  macos: {
    command: "Download and run the macOS installer",
    link: "https://ollama.com/download/Ollama-darwin.zip",
  },
  linux: {
    command: "curl -fsSL https://ollama.com/install.sh | sh",
    link: null,
  },
  windows: {
    command: "Download and run the Windows installer",
    link: "https://ollama.com/download/OllamaSetup.exe",
  },
}

export function OllamaInstaller() {
  const [selectedOS, setSelectedOS] = useState<string>("")

  const handleCopyCommand = () => {
    const os = selectedOS as keyof typeof installationInstructions
    if (os && installationInstructions[os].command) {
      navigator.clipboard.writeText(installationInstructions[os].command)
    }
  }

  return (
    <div className="flex justify-center">
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Install Ollama</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative w-[300px]">
            <Select onValueChange={setSelectedOS} value={selectedOS}>
              <SelectTrigger>
                <SelectValue placeholder="Select your operating system" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="macos">macOS</SelectItem>
                <SelectItem value="linux">Linux</SelectItem>
                <SelectItem value="windows">Windows</SelectItem>
              </SelectContent>
            </Select>
            {selectedOS && (
              <div 
                className="absolute right-8 top-1/2 -translate-y-1/2 cursor-pointer p-1 hover:text-muted-foreground"
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedOS("")
                }}
                role="button"
                aria-label="Clear selection"
              >
                <X className="h-4 w-4" />
              </div>
            )}
          </div>

          {selectedOS && (
            <div className="space-y-4">
              <div className="rounded-md bg-muted p-4">
                <p className="text-sm font-mono">
                  {installationInstructions[selectedOS as keyof typeof installationInstructions].command}
                </p>
              </div>
              <div className="flex gap-4">
                {selectedOS === "linux" ? (
                  <Button onClick={handleCopyCommand} variant="secondary">
                    Copy Install Command
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      const link = installationInstructions[selectedOS as keyof typeof installationInstructions].link;
                      if (link) {
                        window.open(link, "_blank");
                      }
                    }}
                  >
                    Download Installer
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 