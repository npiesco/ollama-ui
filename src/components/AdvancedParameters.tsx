// /ollama-ui/src/components/AdvancedParameters.tsx
import { useState } from 'react'; 
import { Label } from '@/components/ui/label';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { AdvancedParameters } from '@/types/ollama';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EditableValue } from './EditableValue';

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

  const handleChange = (key: keyof AdvancedParameters, value: number | boolean) => {
    const newParams = { ...params, [key]: value };
    setParams(newParams);
    onParamsChange(newParams);
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
              <Label>Temperature</Label>
              <EditableValue
                value={params.temperature || 0.7}
                min={0}
                max={2}
                step={0.1}
                onChange={(value) => handleChange('temperature', value)}
              />
            </div>
            <Slider 
              value={[params.temperature || 0.7]}
              min={0}
              max={2}
              step={0.1}
              onValueChange={([value]) => handleChange('temperature', value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Controls randomness: 0 is focused/deterministic, 2 is more creative/random
            </p>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <Label>Number of Tokens</Label>
              <EditableValue
                value={params.num_predict || 2048}
                min={128}
                max={4096}
                step={128}
                onChange={(value) => handleChange('num_predict', value)}
              />
            </div>
            <Slider 
              value={[params.num_predict || 2048]}
              min={128}
              max={4096}
              step={128}
              onValueChange={([value]) => handleChange('num_predict', value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Maximum number of tokens to generate (longer responses = more tokens)
            </p>
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
              <Label>Top K</Label>
              <EditableValue
                value={params.top_k || 40}
                min={1}
                max={100}
                step={1}
                onChange={(value) => handleChange('top_k', value)}
              />
            </div>
            <Slider 
              value={[params.top_k || 40]}
              min={1}
              max={100}
              step={1}
              onValueChange={([value]) => handleChange('top_k', value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Limits the next token selection to K most probable tokens
            </p>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <Label>Top P</Label>
              <EditableValue
                value={params.top_p || 0.9}
                min={0}
                max={1}
                step={0.05}
                onChange={(value) => handleChange('top_p', value)}
              />
            </div>
            <Slider 
              value={[params.top_p || 0.9]}
              min={0}
              max={1}
              step={0.05}
              onValueChange={([value]) => handleChange('top_p', value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Nucleus sampling: limits cumulative probability of selected tokens
            </p>
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
              <Label>Repeat Penalty</Label>
              <EditableValue
                value={params.repeat_penalty || 1.1}
                min={1}
                max={2}
                step={0.1}
                onChange={(value) => handleChange('repeat_penalty', value)}
              />
            </div>
            <Slider 
              value={[params.repeat_penalty || 1.1]}
              min={1}
              max={2}
              step={0.1}
              onValueChange={([value]) => handleChange('repeat_penalty', value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Penalize repetition: higher values = less repetitive responses
            </p>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <Label>Presence Penalty</Label>
              <EditableValue
                value={params.presence_penalty || 0}
                min={0}
                max={1}
                step={0.1}
                onChange={(value) => handleChange('presence_penalty', value)}
              />
            </div>
            <Slider 
              value={[params.presence_penalty || 0]}
              min={0}
              max={1}
              step={0.1}
              onValueChange={([value]) => handleChange('presence_penalty', value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Penalize new tokens based on their presence in the text so far
            </p>
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
              <Label>Raw Mode</Label>
              <Switch 
                checked={params.raw}
                onCheckedChange={(checked) => handleChange('raw', checked)}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Outputs raw, unfiltered model responses without post-processing
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 