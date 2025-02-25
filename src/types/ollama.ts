// src/types/ollama.ts
export interface AdvancedParameters {
  num_keep?: number;
  seed?: number;
  num_predict?: number;
  top_k?: number;
  top_p?: number;
  min_p?: number;
  typical_p?: number;
  repeat_last_n?: number;
  temperature?: number;
  repeat_penalty?: number;
  presence_penalty?: number;
  frequency_penalty?: number;
  mirostat?: number;
  mirostat_tau?: number;
  mirostat_eta?: number;
  penalize_newline?: boolean;
  stop?: string[];
  raw?: boolean;
  format?: 'json' | string;
  images?: string[];
}

export interface ModelOptions {
  quantization?: 'q2_K' | 'q3_K_L' | 'q3_K_M' | 'q3_K_S' | 'q4_0' | 'q4_1' | 'q4_K_M' | 'q4_K_S' | 'q5_0' | 'q5_1' | 'q5_K_M' | 'q5_K_S' | 'q6_K' | 'q8_0';
  raw?: boolean;
  format?: 'json' | string;
}

export interface Tool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, any>;
  };
} 