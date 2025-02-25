import { useState } from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { AdvancedParameters } from '@/types/ollama';

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

  const handleChange = (key: keyof AdvancedParameters, value: any) => {
    const newParams = { ...params, [key]: value };
    setParams(newParams);
    onParamsChange(newParams);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Temperature</Label>
        <Slider 
          value={[params.temperature || 0.7]}
          min={0}
          max={2}
          step={0.1}
          onValueChange={([value]) => handleChange('temperature', value)}
        />
      </div>
      
      <div>
        <Label>Top K</Label>
        <Slider 
          value={[params.top_k || 40]}
          min={1}
          max={100}
          step={1}
          onValueChange={([value]) => handleChange('top_k', value)}
        />
      </div>

      <div>
        <Label>Raw Mode</Label>
        <Switch 
          checked={params.raw}
          onCheckedChange={(checked) => handleChange('raw', checked)}
        />
      </div>
    </div>
  );
} 