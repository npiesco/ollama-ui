// /ollama-ui/src/app/pull-model/page.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { config } from '@/lib/config'
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface PullStatus {
  status: string
  digest?: string
  total?: number
  completed?: number
}

// Import the recommended models from the models page
const RECOMMENDED_MODELS = [
  {
    name: 'deepseek-r1',
    description: "DeepSeek's first-generation of reasoning models",
    parameterSizes: ['1.5b', '7b', '8b', '14b', '32b', '70b', '671b']
  },
  {
    name: 'phi4-mini',
    description: 'Phi-4-mini with function calling support',
    parameterSizes: ['3.8b']
  },
  {
    name: 'llama3.2',
    description: "Meta's Llama 3.2 small models",
    parameterSizes: ['1b', '3b']
  },
  {
    name: 'llama3.1',
    description: 'Llama 3.1 from Meta',
    parameterSizes: ['8b', '70b', '405b']
  },
  {
    name: 'nomic-embed-text',
    description: 'High-performing open embedding model',
    parameterSizes: ['default']
  },
  {
    name: 'mistral',
    description: 'The 7B model from Mistral AI',
    parameterSizes: ['7b']
  },
  {
    name: 'qwen2.5',
    description: 'Qwen2.5 models from Alibaba',
    parameterSizes: ['0.5b', '1.5b', '3b', '7b', '14b', '32b', '72b']
  },
  {
    name: 'gemma',
    description: 'Lightweight model from Google DeepMind',
    parameterSizes: ['2b']
  }
]

export default function PullModel() {
  const [modelName, setModelName] = useState("")
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<PullStatus | null>(null)
  const [open, setOpen] = useState(false)
  const [selectedModel, setSelectedModel] = useState("")
  const [selectedSize, setSelectedSize] = useState("")

  const handleModelSelect = (model: string) => {
    setSelectedModel(model)
    const modelInfo = RECOMMENDED_MODELS.find(m => m.name === model)
    if (modelInfo) {
      if (modelInfo.parameterSizes.length === 1) {
        // If there's only one size, automatically select it
        const fullModelName = modelInfo.parameterSizes[0] === 'default' 
          ? model  // For models with 'default' size, just use model name
          : `${model}:${modelInfo.parameterSizes[0]}`  // For others, append the size
        setModelName(fullModelName)
        setSelectedSize(modelInfo.parameterSizes[0])
      } else {
        // If there are multiple sizes, just set the model name and wait for size selection
        setModelName(model)
        setSelectedSize("")
      }
    }
    setOpen(false)
  }

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size)
    // For models with 'default' size, don't append size
    const fullModelName = size === 'default' ? selectedModel : `${selectedModel}:${size}`
    setModelName(fullModelName)
  }

  const handlePull = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await fetch(`${config.OLLAMA_API_HOST}/api/pull`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: modelName }),
      })

      if (!response.ok) throw new Error("Failed to initiate model pull")

      const reader = response.body?.getReader()
      if (!reader) throw new Error("Failed to read response stream")

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        // Convert the received chunk to text and parse as JSON
        const chunk = new TextDecoder().decode(value)
        const lines = chunk.split('\n').filter(line => line.trim())
        
        for (const line of lines) {
          try {
            const status: PullStatus = JSON.parse(line)
            setStatus(status)
            
            if (status.status === "success") {
              toast.success("Model pulled successfully")
              setStatus(null)
              break
            }
          } catch (e) {
            console.error("Failed to parse status:", e)
          }
        }
      }
    } catch (err: unknown) {
      const error = err instanceof Error ? err.message : "Failed to pull model"
      toast.error(error)
    } finally {
      setLoading(false)
    }
  }

  const getProgressPercentage = () => {
    if (!status?.total || !status?.completed) return 0
    return Math.round((status.completed / status.total) * 100)
  }

  return (
    <div className="container mx-auto p-8 space-y-6">
      <h1 className="text-2xl font-bold">Pull Model</h1>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Select from Popular Models</label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between"
              >
                {selectedModel
                  ? RECOMMENDED_MODELS.find((model) => model.name === selectedModel)?.name
                  : "Select a model..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Search models..." />
                <CommandList>
                  <CommandEmpty>No model found.</CommandEmpty>
                  <CommandGroup>
                    {RECOMMENDED_MODELS.map((model) => (
                      <CommandItem
                        key={model.name}
                        value={model.name}
                        onSelect={() => handleModelSelect(model.name)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedModel === model.name ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div className="flex flex-col">
                          <span>{model.name}</span>
                          <span className="text-sm text-muted-foreground">{model.description}</span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {selectedModel && (() => {
          const model = RECOMMENDED_MODELS.find(m => m.name === selectedModel)
          return model && model.parameterSizes.length > 1 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Model Size</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between"
                  >
                    {selectedSize || "Select a size..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search sizes..." />
                    <CommandList>
                      <CommandEmpty>No size found.</CommandEmpty>
                      <CommandGroup>
                        {model.parameterSizes.map((size) => (
                          <CommandItem
                            key={size}
                            value={size}
                            onSelect={() => handleSizeSelect(size)}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedSize === size ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {size}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          )
        })()}

        <div className="space-y-2">
          <label className="text-sm font-medium">Or Enter Model Name Manually</label>
          <form onSubmit={handlePull} className="space-y-4">
            <Input
              placeholder="Enter model name (e.g., llama2:latest)"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              disabled={loading}
            />
            <Button type="submit" disabled={loading || !modelName.trim()}>
              {loading ? "Pulling..." : "Pull Model"}
            </Button>
          </form>
        </div>
      </div>

      {status && (
        <div className="space-y-4">
          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="font-semibold">Status: {status.status}</p>
            {status.digest && <p className="text-sm text-gray-600">Digest: {status.digest}</p>}
            {status.total && status.completed && (
              <div className="mt-2">
                <div className="h-2 bg-gray-200 rounded-full">
                  <div 
                    className="h-2 bg-blue-500 rounded-full transition-all duration-300"
                    style={{ width: `${getProgressPercentage()}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {getProgressPercentage()}% - 
                  {(status.completed / 1024 / 1024).toFixed(2)}MB / 
                  {(status.total / 1024 / 1024).toFixed(2)}MB
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 