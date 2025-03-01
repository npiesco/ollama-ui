// /ollama-ui/src/components/AdvancedParameters.tsx
import { useState } from 'react'; 
import { Label } from '@/components/ui/label';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { AdvancedParameters } from '@/types/ollama';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EditableValue } from './EditableValue';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Info } from 'lucide-react';

interface AdvancedParamsProps {
  temperature: number;
  topP: number;
  onParamsChange: (params: AdvancedParameters) => void;
}

export function AdvancedParametersControl({ temperature, topP, onParamsChange }: AdvancedParamsProps) {
  const [params, setParams] = useState<AdvancedParameters>({
    temperature,
    top_p: topP,
  });
  const [expandedParams, setExpandedParams] = useState<string[]>([]);

  const handleChange = (key: keyof AdvancedParameters, value: number | boolean) => {
    const newParams = { ...params, [key]: value };
    setParams(newParams);
    onParamsChange(newParams);
  };

  const toggleDescription = (param: string) => {
    setExpandedParams(prev => 
      prev.includes(param)
        ? prev.filter(p => p !== param)
        : [...prev, param]
    );
  };

  return (
    <div className="space-y-4">
      {/* Core Parameters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Core Parameters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-6 w-6 transition-colors",
                    expandedParams.includes('temperature') ? "text-primary" : "text-muted-foreground hover:text-primary"
                  )}
                  onClick={() => toggleDescription('temperature')}
                >
                  <Info className="h-4 w-4" />
                </Button>
                <Label>Temperature</Label>
              </div>
              <EditableValue
                value={params.temperature || 0.7}
                min={0}
                max={2}
                step={0.1}
                onChange={(value) => handleChange('temperature', value)}
              />
            </div>
            {expandedParams.includes('temperature') && (
              <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded-md border border-muted mb-2">
                Controls randomness: 0 is focused/deterministic, 2 is more creative/random
              </div>
            )}
            <Slider 
              value={[params.temperature || 0.7]}
              min={0}
              max={2}
              step={0.1}
              onValueChange={([value]) => handleChange('temperature', value)}
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-6 w-6 transition-colors",
                    expandedParams.includes('num_predict') ? "text-primary" : "text-muted-foreground hover:text-primary"
                  )}
                  onClick={() => toggleDescription('num_predict')}
                >
                  <Info className="h-4 w-4" />
                </Button>
                <Label>Number of Tokens</Label>
              </div>
              <EditableValue
                value={params.num_predict || 2048}
                min={128}
                max={4096}
                step={128}
                onChange={(value) => handleChange('num_predict', value)}
              />
            </div>
            {expandedParams.includes('num_predict') && (
              <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded-md border border-muted mb-2">
                Maximum number of tokens to generate (longer responses = more tokens)
              </div>
            )}
            <Slider 
              value={[params.num_predict || 2048]}
              min={128}
              max={4096}
              step={128}
              onValueChange={([value]) => handleChange('num_predict', value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Sampling Parameters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Sampling Control</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-6 w-6 transition-colors",
                    expandedParams.includes('top_k') ? "text-primary" : "text-muted-foreground hover:text-primary"
                  )}
                  onClick={() => toggleDescription('top_k')}
                >
                  <Info className="h-4 w-4" />
                </Button>
                <Label>Top K</Label>
              </div>
              <EditableValue
                value={params.top_k || 40}
                min={1}
                max={100}
                step={1}
                onChange={(value) => handleChange('top_k', value)}
              />
            </div>
            {expandedParams.includes('top_k') && (
              <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded-md border border-muted mb-2">
                Limits the next token selection to K most probable tokens
              </div>
            )}
            <Slider 
              value={[params.top_k || 40]}
              min={1}
              max={100}
              step={1}
              onValueChange={([value]) => handleChange('top_k', value)}
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-6 w-6 transition-colors",
                    expandedParams.includes('top_p') ? "text-primary" : "text-muted-foreground hover:text-primary"
                  )}
                  onClick={() => toggleDescription('top_p')}
                >
                  <Info className="h-4 w-4" />
                </Button>
                <Label>Top P</Label>
              </div>
              <EditableValue
                value={params.top_p || 0.9}
                min={0}
                max={1}
                step={0.05}
                onChange={(value) => handleChange('top_p', value)}
              />
            </div>
            {expandedParams.includes('top_p') && (
              <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded-md border border-muted mb-2">
                Nucleus sampling: limits cumulative probability of selected tokens
              </div>
            )}
            <Slider 
              value={[params.top_p || 0.9]}
              min={0}
              max={1}
              step={0.05}
              onValueChange={([value]) => handleChange('top_p', value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Quality Parameters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Quality Control</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-6 w-6 transition-colors",
                    expandedParams.includes('repeat_penalty') ? "text-primary" : "text-muted-foreground hover:text-primary"
                  )}
                  onClick={() => toggleDescription('repeat_penalty')}
                >
                  <Info className="h-4 w-4" />
                </Button>
                <Label>Repeat Penalty</Label>
              </div>
              <EditableValue
                value={params.repeat_penalty || 1.1}
                min={1}
                max={2}
                step={0.1}
                onChange={(value) => handleChange('repeat_penalty', value)}
              />
            </div>
            {expandedParams.includes('repeat_penalty') && (
              <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded-md border border-muted mb-2">
                Penalize repetition: higher values = less repetitive responses
              </div>
            )}
            <Slider 
              value={[params.repeat_penalty || 1.1]}
              min={1}
              max={2}
              step={0.1}
              onValueChange={([value]) => handleChange('repeat_penalty', value)}
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-6 w-6 transition-colors",
                    expandedParams.includes('presence_penalty') ? "text-primary" : "text-muted-foreground hover:text-primary"
                  )}
                  onClick={() => toggleDescription('presence_penalty')}
                >
                  <Info className="h-4 w-4" />
                </Button>
                <Label>Presence Penalty</Label>
              </div>
              <EditableValue
                value={params.presence_penalty || 0}
                min={0}
                max={1}
                step={0.1}
                onChange={(value) => handleChange('presence_penalty', value)}
              />
            </div>
            {expandedParams.includes('presence_penalty') && (
              <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded-md border border-muted mb-2">
                Penalize new tokens based on their presence in the text so far
              </div>
            )}
            <Slider 
              value={[params.presence_penalty || 0]}
              min={0}
              max={1}
              step={0.1}
              onValueChange={([value]) => handleChange('presence_penalty', value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Advanced Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Advanced Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-6 w-6 transition-colors",
                    expandedParams.includes('raw') ? "text-primary" : "text-muted-foreground hover:text-primary"
                  )}
                  onClick={() => toggleDescription('raw')}
                >
                  <Info className="h-4 w-4" />
                </Button>
                <Label>Raw Mode</Label>
              </div>
              <Switch 
                checked={params.raw}
                onCheckedChange={(checked) => handleChange('raw', checked)}
              />
            </div>
            {expandedParams.includes('raw') && (
              <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded-md border border-muted mt-2">
                Outputs raw, unfiltered model responses without post-processing
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 