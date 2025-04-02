// /ollama-ui/src/app/models/page.tsx
"use client"

import React, { useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Trash2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { ModelResponse } from '@/types/ollama'
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import Link from 'next/link'
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useModelDownload } from '@/store/model-download'

type ModelCapability = 'tools' | 'embedding' | 'vision' | 'all';

interface LibraryModel extends ModelResponse {
  description: string;
  capabilities: ModelCapability[];
  parameterSizes: string[];
  pullCount: number;
  tagCount: number;
  lastUpdated: string;
}

const ModelsPage: React.FC = (): React.ReactElement => {
  const [models, setModels] = React.useState<ModelResponse[]>([])
  const [libraryModels, setLibraryModels] = React.useState<LibraryModel[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [selectedSizes, setSelectedSizes] = React.useState<Record<string, string>>({})
  const [focusedModel, setFocusedModel] = React.useState<string | null>(null)
  const [selectedTab, setSelectedTab] = React.useState("all")
  const [showAdvanced, setShowAdvanced] = React.useState<Record<string, boolean>>({})
  const [modelConfig, setModelConfig] = React.useState<Record<string, string>>({})
  const [pageError, setPageError] = React.useState<string | null>(null)
  const [newModelName, setNewModelName] = React.useState("")
  const [isRefreshing, setIsRefreshing] = React.useState(false)

  const { 
    isDownloading, 
    currentModel, 
    progress, 
    status,
    startDownload, 
    updateProgress, 
    setStatus, 
    setError, 
    reset 
  } = useModelDownload()

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await Promise.all([fetchModels(), fetchLibraryModels()])
      toast.success('Models refreshed')
    } catch (err) {
      toast.error('Failed to refresh models')
    } finally {
      setIsRefreshing(false)
    }
  }

  const fetchModels = React.useCallback(async () => {
    console.debug('[ModelsPage] Fetching models:', {
      currentModels: models?.length,
      isLoading,
      pageError
    });
    
    try {
      const response = await fetch("/api/models")
      if (!response.ok) {
        throw new Error("Failed to fetch models")
      }
      const data = await response.json()
      console.debug('[ModelsPage] Models fetch response:', {
        status: response.status,
        modelCount: data.models?.length,
        modelNames: data.models?.map((m: ModelResponse) => m.name)
      });
      setModels(data.models)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch models"
      console.error('[ModelsPage] Error fetching models:', {
        error: err,
        errorMessage,
        stack: err instanceof Error ? err.stack : undefined
      });
      setPageError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchLibraryModels = async () => {
    console.debug('[ModelsPage] Fetching library models:', {
      currentLibraryModels: libraryModels?.length,
      isLoading
    });
    
    try {
      const response = await fetch('/api/models/library')
      if (!response.ok) throw new Error('Failed to fetch library models')
      const data = await response.json()
      console.debug('[ModelsPage] Library models fetch response:', {
        status: response.status,
        modelCount: data.models?.length,
        modelDetails: data.models?.map((m: LibraryModel) => ({
          name: m.name,
          capabilities: m.capabilities,
          parameterSizes: m.parameterSizes,
          pullCount: m.pullCount
        }))
      });
      setLibraryModels(data.models || [])
    } catch (error) {
      console.error('[ModelsPage] Error fetching library models:', {
        error,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      toast.error('Failed to fetch library models')
      setLibraryModels([])
    }
  }

  // Scroll to focused model when the carousel is ready
  useEffect(() => {
    if (focusedModel) {
      const modelIndex = libraryModels.findIndex(model => model.name === focusedModel)
      if (modelIndex !== -1) {
        // Find the carousel item
        const carouselItem = document.querySelector(`[data-model="${focusedModel}"]`) as HTMLElement
        if (carouselItem) {
          carouselItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
          carouselItem.classList.add('ring-2', 'ring-primary', 'ring-offset-2')
          setTimeout(() => {
            carouselItem.classList.remove('ring-2', 'ring-primary', 'ring-offset-2')
          }, 3000)
        }
      }
    }
  }, [focusedModel, libraryModels])

  useEffect(() => {
    fetchModels()
    fetchLibraryModels()
    // Check if we should focus on a specific model
    const modelToFocus = sessionStorage.getItem('focusModel')
    if (modelToFocus) {
      setFocusedModel(modelToFocus)
      sessionStorage.removeItem('focusModel')
    }
  }, [fetchModels])

  const handleTabChange = (value: string) => {
    console.debug('[ModelsPage] Tab change:', {
      from: selectedTab,
      to: value,
      availableModels: models?.length,
      libraryModels: libraryModels?.length,
      filteredModels: models?.filter(m => {
        const libraryModel = libraryModels?.find(lm => lm.name === m.name);
        return libraryModel?.capabilities?.includes(value as ModelCapability);
      }).length,
      modelCapabilities: libraryModels?.map(m => ({
        name: m.name,
        capabilities: m.capabilities
      }))
    });
    setSelectedTab(value);
  };

  // Add detailed logging for model filtering
  const filteredModels = useMemo(() => {
    console.debug('[ModelsPage] Starting model filtering:', {
      selectedTab,
      totalModels: models?.length,
      libraryModels: libraryModels?.length,
      modelNames: models?.map(m => m.name),
      libraryModelNames: libraryModels?.map(m => m.name)
    });

    if (!models || !libraryModels) {
      console.debug('[ModelsPage] Filtering skipped - missing data:', {
        hasModels: !!models,
        hasLibraryModels: !!libraryModels
      });
      return [];
    }

    const filtered = models.filter(model => {
      const libraryModel = libraryModels.find(lm => lm.name === model.name);
      const matchesCapability = selectedTab === 'all' || 
        libraryModel?.capabilities?.includes(selectedTab as ModelCapability);
      
      console.debug('[ModelsPage] Model filter check:', {
        modelName: model.name,
        selectedTab,
        libraryModelFound: !!libraryModel,
        capabilities: libraryModel?.capabilities,
        matchesCapability,
        result: matchesCapability ? 'included' : 'excluded'
      });

      return matchesCapability;
    });

    console.debug('[ModelsPage] Filtering complete:', {
      inputCount: models.length,
      outputCount: filtered.length,
      filteredNames: filtered.map(m => m.name)
    });

    return filtered;
  }, [models, libraryModels, selectedTab]);

  // Add effect to log state changes
  useEffect(() => {
    console.debug('[ModelsPage] State update:', {
      selectedTab,
      isLoading,
      pageError,
      modelCount: models?.length,
      libraryModelCount: libraryModels?.length,
      selectedSizes,
      showAdvanced,
      focusedModel,
      isDownloading,
      currentModel,
      progress,
      status
    });
  }, [
    selectedTab,
    isLoading,
    pageError,
    models,
    libraryModels,
    selectedSizes,
    showAdvanced,
    focusedModel,
    isDownloading,
    currentModel,
    progress,
    status
  ]);

  // Add effect to log filtered models changes
  useEffect(() => {
    console.debug('[ModelsPage] Filtered models update:', {
      selectedTab,
      filteredCount: filteredModels.length,
      filteredNames: filteredModels.map(m => m.name),
      modelCapabilities: filteredModels.map(m => {
        const libraryModel = libraryModels?.find(lm => lm.name === m.name);
        return {
          name: m.name,
          capabilities: libraryModel?.capabilities
        };
      })
    });
  }, [filteredModels, selectedTab, libraryModels]);

  // Add effect to log model installation status changes
  useEffect(() => {
    console.debug('[ModelsPage] Model installation status:', {
      installedModels: models?.map(m => m.name),
      libraryModels: libraryModels?.map(m => m.name),
      installationStatus: libraryModels?.map(m => ({
        name: m.name,
        isInstalled: isModelInstalled(m.name),
        fullName: getModelFullName({ name: m.name, details: {} } as ModelResponse)
      }))
    });
  }, [models, libraryModels]);

  const handleModelDelete = async (modelName: string) => {
    console.debug('[ModelsPage] Starting model deletion:', {
      modelName,
      currentModels: models?.map(m => m.name),
      isInstalled: isModelInstalled(modelName)
    });
    
    try {
      const response = await fetch('/api/delete-model', {
        method: 'DELETE',
        body: JSON.stringify({ name: modelName })
      });

      console.debug('[ModelsPage] Delete response:', {
        status: response.status,
        ok: response.ok,
        modelName
      });

      if (!response.ok) {
        throw new Error('Failed to delete model');
      }

      toast.success(`Successfully deleted ${modelName}`, {
        position: 'top-right',
        duration: 3000,
        dismissible: true
      });

      // Refresh models list
      console.debug('[ModelsPage] Refreshing models after deletion');
      fetchModels();
    } catch (error) {
      console.error('[ModelsPage] Error deleting model:', {
        error,
        modelName,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      toast.error(error instanceof Error ? error.message : 'Failed to delete model');
    }
  };

  const handleModelPull = async (modelName: string, modelTag?: string) => {
    console.debug('[ModelsPage] Starting model pull:', {
      modelName,
      modelTag,
      currentStatus: status,
      isDownloading,
      currentModel,
      selectedSize: selectedSizes[modelName],
      libraryModel: libraryModels?.find(m => m.name === modelName)
    });

    const fullModelName = modelTag ? `${modelName}:${modelTag}` : modelName;
    
    try {
      startDownload(fullModelName);
      setStatus('pulling');

      const response = await fetch('/api/models/pull', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: modelName, tag: modelTag })
      });

      console.debug('[ModelsPage] Pull response:', {
        status: response.status,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries()),
        modelName: fullModelName
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to pull model');
      }

      // Check if it's a non-streaming response (model already installed)
      const contentType = response.headers.get('content-type')
      console.debug('[ModelsPage] Response content type:', {
        contentType,
        modelName: fullModelName
      });

      if (!contentType?.includes('text/event-stream')) {
        const data = await response.json()
        console.debug('[ModelsPage] Non-streaming response:', {
          data,
          modelName: fullModelName
        });
        if (data.status === 'success') {
          setStatus('success')
          await fetchModels() // Refresh the models list
          return
        }
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('Failed to read response stream')

      let buffer = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        // Convert the received chunk to text
        const chunk = new TextDecoder().decode(value)
        buffer += chunk

        // Process complete lines
        const lines = buffer.split('\n')
        buffer = lines.pop() || '' // Keep the last incomplete line in the buffer
        
        for (const line of lines) {
          if (!line.trim()) continue

          try {
            const status = JSON.parse(line)
            console.debug('[ModelsPage] Pull status update:', {
              status,
              modelName: fullModelName,
              currentProgress: progress
            });
            
            if (status.status === "error") {
              throw new Error(status.error || 'Failed to pull model')
            } else if (status.status === "success") {
              setStatus('success')
              await fetchModels() // Refresh the models list
              return
            } else if (status.status.startsWith("pulling")) {
              setStatus('pulling')
              if (status.total && status.completed) {
                const progress = Math.round((status.completed / status.total) * 100)
                console.debug('[ModelsPage] Progress update:', {
                  completed: status.completed,
                  total: status.total,
                  progress,
                  modelName: fullModelName
                });
                updateProgress(progress)
              }
            }
          } catch (e) {
            console.error('[ModelsPage] Failed to parse status:', {
              error: e,
              rawLine: line,
              modelName: fullModelName
            });
            throw new Error('Failed to parse model pull status')
          }
        }
      }

      // If we get here without a success status, something went wrong
      throw new Error('Model pull did not complete successfully')
    } catch (error) {
      console.error('[ModelsPage] Error pulling model:', {
        error,
        modelName: fullModelName,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        currentStatus: status,
        stack: error instanceof Error ? error.stack : undefined
      });
      setError(error instanceof Error ? error.message : 'Failed to pull model');
      setStatus('error')
    } finally {
      reset()
    }
  }

  const isModelInstalled = (modelName: string) => {
    console.debug('[ModelsPage] Checking if model is installed:', {
      modelName,
      currentModels: models?.map(m => m.name),
      normalizedName: modelName.toLowerCase()
    });
    
    if (!models || models.length === 0) {
      console.debug('[ModelsPage] No models available');
      return false;
    }
    
    const normalizedName = modelName.toLowerCase();
    const isInstalled = models.some(model => {
      const installedName = (model.name || '').toLowerCase();
      const matches = installedName === normalizedName;
      
      console.debug('[ModelsPage] Model installation check:', {
        modelName,
        installedName,
        normalizedName,
        matches
      });
      
      return matches;
    });
    
    console.debug('[ModelsPage] Installation check result:', {
      modelName,
      isInstalled
    });
    
    return isInstalled;
  }

  const deleteModel = async (modelName: string) => {
    if (!modelName || !isModelInstalled(modelName)) return

    try {
      const response = await fetch('/api/delete-model', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: modelName })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete model')
      }

      toast.success(`Successfully deleted ${modelName}`, {
        position: 'top-right',
        duration: 3000,
        dismissible: true
      })
      await fetchModels() // Wait for models to refresh
    } catch (error) {
      console.error('Error deleting model:', error)
      toast.error(`Failed to delete ${modelName}`, {
        position: 'top-right',
        duration: 3000,
        dismissible: true
      })
    }
  }

  // Group models by capability with detailed logging
  const modelsByCapability = useMemo(() => {
    console.debug('[ModelsPage] Computing models by capability:', {
      totalLibraryModels: libraryModels?.length,
      modelNames: libraryModels?.map(m => m.name),
      capabilities: libraryModels?.map(m => m.capabilities)
    });

    const result = {
      all: libraryModels,
      tools: libraryModels.filter(m => {
        const hasTools = m.capabilities.includes('tools');
        console.debug('[ModelsPage] Tools capability check:', {
          model: m.name,
          capabilities: m.capabilities,
          hasTools
        });
        return hasTools;
      }),
      embeddings: libraryModels.filter(m => {
        const hasEmbeddings = m.capabilities.includes('embedding');
        console.debug('[ModelsPage] Embeddings capability check:', {
          model: m.name,
          capabilities: m.capabilities,
          hasEmbeddings
        });
        return hasEmbeddings;
      }),
      vision: libraryModels.filter(m => {
        const hasVision = m.capabilities.includes('vision');
        console.debug('[ModelsPage] Vision capability check:', {
          model: m.name,
          capabilities: m.capabilities,
          hasVision
        });
        return hasVision;
      }),
    };

    console.debug('[ModelsPage] Models by capability result:', {
      allCount: result.all?.length,
      toolsCount: result.tools?.length,
      embeddingsCount: result.embeddings?.length,
      visionCount: result.vision?.length
    });

    return result;
  }, [libraryModels]);

  const getModelFullName = (model: ModelResponse) => {
    console.debug('[ModelsPage] Computing model full name:', {
      modelName: model.name,
      selectedSize: selectedSizes[model.name],
      libraryModel: libraryModels?.find(m => m.name === model.name),
      defaultSize: libraryModels?.find(m => m.name === model.name)?.parameterSizes[0]
    });

    const libraryModel = libraryModels?.find(m => m.name === model.name);
    const selectedSize = selectedSizes[model.name];
    const defaultSize = libraryModel?.parameterSizes?.[0];
    const size = selectedSize || defaultSize;

    const fullName = size ? `${model.name}:${size}` : model.name;
    
    console.debug('[ModelsPage] Model full name result:', {
      input: model.name,
      selectedSize,
      defaultSize,
      result: fullName
    });

    return fullName;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-10 w-full max-w-md mx-auto" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse rounded-md bg-muted h-64" data-testid="skeleton" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (pageError) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{pageError}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Models</h1>
        <Button 
          variant="outline" 
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          {isRefreshing ? 'Refreshing...' : 'Refresh Models'}
        </Button>
      </div>

      {filteredModels.length === 0 && !isLoading && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Welcome to Ollama UI!</AlertTitle>
          <AlertDescription>
            To get started, you&apos;ll need to install at least one model. Browse the available models below.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={selectedTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="w-full max-w-md mx-auto grid grid-cols-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="tools">Tools</TabsTrigger>
          <TabsTrigger value="embedding">Embedding</TabsTrigger>
          <TabsTrigger value="vision">Vision</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="mt-6">
            <ScrollArea className="w-full max-w-5xl mx-auto h-[calc(100vh-300px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredModels.map((model) => (
                <Card 
                  key={`${model.name}-${selectedSizes[model.name] || libraryModels.find(m => m.name === model.name)?.parameterSizes?.[0] || 'default'}`} 
                  className={cn(
                    'h-full flex flex-col',
                    isModelInstalled(getModelFullName(model)) ? 'bg-primary/5' : ''
                  )}
                  data-testid={`model-card-${model.name}`}
                >
                    <CardHeader>
                    {(() => {
                      const libraryModel = libraryModels.find(m => m.name === model.name);
                      return (
                        <>
                      <CardTitle className="flex items-center gap-2">
                        {model.name}
                            {libraryModel?.capabilities?.map(cap => (
                          <span key={cap} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                            {cap}
                          </span>
                        ))}
                      </CardTitle>
                          <CardDescription>{libraryModel?.description}</CardDescription>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span>👥 {libraryModel?.pullCount}</span>
                            <span>🏷️ {libraryModel?.tagCount}</span>
                            <span>🕒 {libraryModel?.lastUpdated}</span>
                      </div>
                        </>
                      );
                    })()}
                    </CardHeader>

                    <CardContent className="space-y-4 flex-grow">
                    {(() => {
                      const libraryModel = libraryModels.find(m => m.name === model.name);
                      return (
                        <>
                      <div className="flex items-center justify-between">
                        <Label>Advanced Configuration</Label>
                        <Switch
                          checked={showAdvanced[model.name] || false}
                          onCheckedChange={(checked) => {
                            setShowAdvanced(prev => ({ ...prev, [model.name]: checked }))
                          }}
                        />
                      </div>

                      {showAdvanced[model.name] && (
                        <>
                          <Separator className="my-4" />
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label>Model Parameters</Label>
                              <Textarea
                                placeholder="Enter model parameters in JSON format..."
                                value={modelConfig[model.name] || ''}
                                onChange={(e) => setModelConfig(prev => ({
                                  ...prev,
                                  [model.name]: e.target.value
                                }))}
                                className="h-24"
                              />
                            </div>
                          </div>
                        </>
                      )}

                          {(libraryModel?.parameterSizes?.length ?? 0) > 0 && (
                        <Select
                              value={selectedSizes[model.name] || libraryModel?.parameterSizes?.[0] || ''}
                          onValueChange={(value) => setSelectedSizes(prev => ({ ...prev, [model.name]: value }))}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select size" />
                          </SelectTrigger>
                          <SelectContent>
                                {libraryModel?.parameterSizes?.map((size) => (
                              <SelectItem key={size} value={size}>
                                {size}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                        </>
                      );
                    })()}
                    </CardContent>

                    <CardFooter className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-2">
                      {isModelInstalled(getModelFullName(model)) ? (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Installed</span>
                          </div>
                        ) : (
                          <Button
                          onClick={() => handleModelPull(
                              model.name,
                            selectedSizes[model.name] || libraryModels.find(m => m.name === model.name)?.parameterSizes?.[0]
                            )}
                          disabled={isDownloading}
                            variant="outline"
                          >
                          {currentModel === `${model.name}:${selectedSizes[model.name] || libraryModels.find(m => m.name === model.name)?.parameterSizes?.[0]}` ? 'Pulling...' : 'Install Model'}
                          </Button>
                        )}
                      </div>
                    {isModelInstalled(`${model.name}:${selectedSizes[model.name] || libraryModels.find(m => m.name === model.name)?.parameterSizes?.[0]}`) && (
                        <Button
                          variant="destructive"
                        onClick={() => handleModelDelete(`${model.name}:${selectedSizes[model.name] || libraryModels.find(m => m.name === model.name)?.parameterSizes?.[0]}`)}
                          aria-label="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
      </Tabs>

      {focusedModel === 'nomic-embed-text' && !isModelInstalled('nomic-embed-text') && (
        <Alert className="max-w-5xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Install Required Model</AlertTitle>
          <AlertDescription>
            The nomic-embed-text model is required for generating embeddings. Please install it to use the embeddings feature.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

export default ModelsPage 