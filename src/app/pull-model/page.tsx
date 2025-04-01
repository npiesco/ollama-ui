// /ollama-ui/src/app/pull-model/page.tsx
"use client"

import { useState, useEffect } from "react"
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

interface LibraryModel {
  name: string
  description: string
  parameterSizes: string[]
  capabilities: string[]
  pullCount: string
  tagCount: string
  lastUpdated: string
}

export default function PullModel() {
  const [modelName, setModelName] = useState("")
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<PullStatus | null>(null)
  const [open, setOpen] = useState(false)
  const [selectedModel, setSelectedModel] = useState("")
  const [selectedSize, setSelectedSize] = useState("")
  const [libraryModels, setLibraryModels] = useState<LibraryModel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [inputValue, setInputValue] = useState("")

  useEffect(() => {
    fetchLibraryModels()
  }, [])

  const fetchLibraryModels = async () => {
    try {
      const response = await fetch('/api/models/library')
      if (!response.ok) throw new Error('Failed to fetch library models')
      const data = await response.json()
      setLibraryModels(data.models || [])
    } catch (error) {
      console.error('Error fetching library models:', error)
      toast.error('Failed to fetch library models')
      setLibraryModels([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleModelSelect = (model: string) => {
    setSelectedModel(model)
    const modelInfo = libraryModels.find(m => m.name === model)
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

  const filteredModels = libraryModels.filter(model => {
    if (!inputValue) return true // Show all models when input is empty
    const searchTerm = inputValue.toLowerCase()
    const modelName = model.name.toLowerCase()
    
    // Only show models that start with the search term
    return modelName.startsWith(searchTerm)
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    setModelName(value)
    setShowSuggestions(true)
  }

  // Add click outside handler to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.suggestions-container')) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSuggestionSelect = (model: LibraryModel, size?: string) => {
    const fullModelName = size ? `${model.name}:${size}` : model.name
    setModelName(fullModelName)
    setInputValue(fullModelName)
    setShowSuggestions(false)
  }

  return (
    <div className="container mx-auto p-8 space-y-6">
      <h1 className="text-2xl font-bold">Pull Model</h1>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Select from Available Models</label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between"
              >
                {selectedModel
                  ? libraryModels.find((model) => model.name === selectedModel)?.name
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
                    {libraryModels.map((model) => (
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
          const model = libraryModels.find(m => m.name === selectedModel)
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

        <form onSubmit={handlePull} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Or Enter Model Name Manually</label>
            <div className="relative suggestions-container">
              <Input
                value={inputValue}
                onChange={handleInputChange}
                onFocus={() => setShowSuggestions(true)}
                placeholder="e.g., llama2:7b"
                disabled={loading}
              />
              {showSuggestions && (
                <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-auto">
                  <div className="p-1">
                    {filteredModels.length === 0 ? (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">
                        No models found
                      </div>
                    ) : (
                      filteredModels.map((model) => (
                        <div key={model.name} className="space-y-1">
                          <button
                            className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground rounded-sm"
                            onClick={() => handleSuggestionSelect(model)}
                          >
                            <div className="font-medium">{model.name}</div>
                            <div className="text-xs text-muted-foreground">{model.description}</div>
                          </button>
                          {model.parameterSizes.length > 0 && (
                            <div className="ml-4 space-y-1">
                              {model.parameterSizes.map((size) => (
                                <button
                                  key={size}
                                  className="w-full text-left px-2 py-1 text-xs hover:bg-accent hover:text-accent-foreground rounded-sm"
                                  onClick={() => handleSuggestionSelect(model, size)}
                                >
                                  {size === 'default' ? model.name : `${model.name}:${size}`}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {status && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Downloading...</span>
                <span>{getProgressPercentage()}%</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${getProgressPercentage()}%` }}
                />
              </div>
            </div>
          )}

          <Button type="submit" disabled={loading || !modelName}>
            {loading ? "Pulling..." : "Pull Model"}
          </Button>
        </form>
      </div>
    </div>
  )
} 