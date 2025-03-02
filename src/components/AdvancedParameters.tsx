// /ollama-ui/src/components/AdvancedParameters.tsx
import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { AdvancedParameters } from '@/types/ollama';
import { Button } from '@/components/ui/button';
import { Settings2 } from 'lucide-react';
import { EditableValue } from './EditableValue';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

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
  const [open, setOpen] = useState(false);

  const handleChange = (key: keyof AdvancedParameters, value: number | boolean) => {
    const newParams = { ...params, [key]: value };
    setParams(newParams);
    onParamsChange(newParams);
  };

  const renderParameter = (
    label: string,
    key: keyof AdvancedParameters,
    description: string,
    config: {
      min: number;
      max: number;
      step: number;
      defaultValue: number;
    }
  ) => (
    <div className="space-y-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="space-y-1 flex-1">
          <Label>{label}</Label>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <EditableValue
          value={params[key] as number || config.defaultValue}
          min={config.min}
          max={config.max}
          step={config.step}
          onChange={(value) => handleChange(key, value)}
        />
      </div>
      <Slider
        value={[params[key] as number || config.defaultValue]}
        min={config.min}
        max={config.max}
        step={config.step}
        onValueChange={([value]) => handleChange(key, value)}
      />
    </div>
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full group relative hover:bg-primary/5 hover:border-primary/20 hover:text-primary transition-all duration-200"
        >
          <div className="absolute inset-0 hidden group-hover:flex items-center justify-center bg-accent text-accent-foreground text-[10px] px-2">
            <span className="line-clamp-1">Adjust model parameters</span>
          </div>
          <div className="flex items-center w-full text-sm">
            <Settings2 className="w-4 h-4 ml-2 transition-colors duration-200 group-hover:text-primary" />
            <span className="flex-grow text-center transition-colors duration-200 group-hover:text-primary">Parameters</span>
          </div>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[95%] sm:max-w-md transition-transform duration-300">
        <SheetHeader>
          <SheetTitle>Model Parameters</SheetTitle>
          <SheetDescription>
            Adjust these parameters to control the model&apos;s behavior and output quality.
          </SheetDescription>
        </SheetHeader>
        
        <div className="py-4 space-y-4 overflow-y-auto max-h-[calc(100vh-8rem)]">
          <div className="space-y-4">
            <h4 className="text-sm font-medium group-hover:text-primary transition-colors">Core Parameters</h4>
            {renderParameter(
              "Temperature",
              "temperature",
              "Controls randomness: lower values are more focused, higher values more creative",
              { min: 0, max: 2, step: 0.1, defaultValue: 0.7 }
            )}
            {renderParameter(
              "Number of Tokens",
              "num_predict",
              "Maximum number of tokens to generate",
              { min: 128, max: 4096, step: 128, defaultValue: 2048 }
            )}
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="text-sm font-medium group-hover:text-primary transition-colors">Sampling Control</h4>
            {renderParameter(
              "Top K",
              "top_k",
              "Limits the next token selection to K most probable tokens",
              { min: 1, max: 100, step: 1, defaultValue: 40 }
            )}
            {renderParameter(
              "Top P",
              "top_p",
              "Nucleus sampling: limits cumulative probability of selected tokens",
              { min: 0, max: 1, step: 0.05, defaultValue: 0.9 }
            )}
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="text-sm font-medium group-hover:text-primary transition-colors">Quality Control</h4>
            {renderParameter(
              "Repeat Penalty",
              "repeat_penalty",
              "Penalize repetition: higher values = less repetitive responses",
              { min: 1, max: 2, step: 0.1, defaultValue: 1.1 }
            )}
            {renderParameter(
              "Presence Penalty",
              "presence_penalty",
              "Penalize new tokens based on their presence in the text so far",
              { min: 0, max: 1, step: 0.1, defaultValue: 0 }
            )}
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="text-sm font-medium group-hover:text-primary transition-colors">Advanced Options</h4>
            <div className="flex items-center justify-between group">
              <div className="space-y-1 relative">
                <Label>Raw Mode</Label>
                <p className="text-xs text-muted-foreground">
                  Output raw, unfiltered model responses
                </p>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center px-3 py-2 bg-muted/95">
                  <span className="text-[10px] text-muted-foreground line-clamp-2">
                    Enable raw mode to receive unprocessed model output
                  </span>
                </div>
              </div>
              <Switch
                checked={params.raw}
                onCheckedChange={(checked) => handleChange('raw', checked)}
                className="transition-transform duration-200 group-hover:scale-105"
              />
            </div>
          </div>
        </div>

        <SheetFooter>
          <Button 
            variant="outline" 
            onClick={() => setOpen(false)}
            className="hover:bg-primary/5 hover:border-primary/20 hover:text-primary transition-all duration-200"
          >
            Close
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
} 