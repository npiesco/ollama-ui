declare module 'onnxruntime-web' {
  export * from 'onnxruntime-web/types';

  export interface InferenceSession {
    run(input: { [name: string]: any }): Promise<{ [name: string]: any }>;
  }

  export namespace InferenceSession {
    interface SessionOptions {
      executionProviders: string[];
      graphOptimizationLevel: 'all' | 'basic' | 'extended' | 'none';
      executionMode?: 'sequential' | 'parallel';
      enableCpuMemArena?: boolean;
      enableMemPattern?: boolean;
      extra?: Record<string, any>;
    }
  }

  export const InferenceSession: {
    create(model: Uint8Array, options?: InferenceSession.SessionOptions): Promise<InferenceSession>;
  };

  export class Tensor {
    constructor(type: string, data: Float32Array, dims: number[]);
  }

  export const env: {
    wasm: {
      wasmPaths: string;
    };
  };
} 