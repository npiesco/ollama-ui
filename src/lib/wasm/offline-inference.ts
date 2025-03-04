// src/lib/wasm/offline-inference.ts
import * as ort from 'onnxruntime-web';

// Initialize ONNX Runtime
export async function initWasm() {
  // Set the WebAssembly binary file path to the local node_modules
  ort.env.wasm.wasmPaths = '/node_modules/onnxruntime-web/dist/';

  // Create session options
  const sessionOptions: ort.InferenceSession.SessionOptions = {
    executionProviders: ['wasm'],
    graphOptimizationLevel: 'all' as const,
    executionMode: 'sequential',
    enableCpuMemArena: true,
    enableMemPattern: true,
    extra: {
      session: {
        use_ort_model_bytes_directly: true,
        log_severity_level: 0,
      },
    },
  };

  // Initialize WASM backend
  await ort.InferenceSession.create(new Uint8Array(0), sessionOptions);
}

export class OfflineInference {
  private session: ort.InferenceSession | null = null;
  private modelPath: string;

  constructor(modelPath: string) {
    this.modelPath = modelPath;
  }

  async loadModel() {
    try {
      // Load model from IndexedDB or download if not available
      const modelBuffer = await this.getModelBuffer();
      this.session = await ort.InferenceSession.create(modelBuffer, {
        executionProviders: ['wasm'],
        graphOptimizationLevel: 'all',
      });
    } catch (error) {
      console.error('Failed to load model:', error);
      throw error;
    }
  }

  private async getModelBuffer(): Promise<ArrayBuffer> {
    try {
      // Check IndexedDB first
      const db = await this.openIndexedDB();
      const modelBuffer = await this.getFromIndexedDB(db);
      if (modelBuffer) {
        return modelBuffer;
      }

      // If not in IndexedDB, download and cache
      const response = await fetch(this.modelPath);
      if (!response.ok) {
        throw new Error(`Failed to fetch model: ${response.statusText}`);
      }
      const buffer = await response.arrayBuffer();
      await this.saveToIndexedDB(db, buffer);
      return buffer;
    } catch (error) {
      console.error('Failed to get model buffer:', error);
      throw error;
    }
  }

  private async openIndexedDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('ollama-offline', 1);
      request.onerror = () => reject(new Error(`Failed to open IndexedDB: ${request.error?.message}`));
      request.onsuccess = () => resolve(request.result);
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('models')) {
          db.createObjectStore('models');
        }
      };
    });
  }

  private async getFromIndexedDB(db: IDBDatabase): Promise<ArrayBuffer | null> {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['models'], 'readonly');
      const store = transaction.objectStore('models');
      const request = store.get(this.modelPath);
      request.onerror = () => reject(new Error(`Failed to get from IndexedDB: ${request.error?.message}`));
      request.onsuccess = () => resolve(request.result);
    });
  }

  private async saveToIndexedDB(db: IDBDatabase, buffer: ArrayBuffer): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['models'], 'readwrite');
      const store = transaction.objectStore('models');
      const request = store.put(buffer, this.modelPath);
      request.onerror = () => reject(new Error(`Failed to save to IndexedDB: ${request.error?.message}`));
      request.onsuccess = () => resolve();
    });
  }

  async infer(input: Float32Array): Promise<Float32Array> {
    if (!this.session) {
      throw new Error('Model not loaded');
    }

    try {
      const tensor = new ort.Tensor('float32', input, [1, input.length]);
      const results = await this.session.run({ input: tensor });
      return results.output.data as Float32Array;
    } catch (error) {
      console.error('Inference failed:', error);
      throw error;
    }
  }
} 