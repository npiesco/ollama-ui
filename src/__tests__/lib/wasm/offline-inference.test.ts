// ollama-ui/src/lib/wasm/__tests__/offline-inference.test.ts
import { InferenceSession } from 'onnxruntime-web';

import { OfflineInference } from '@/lib/wasm/offline-inference';

// Mock ONNX Runtime
jest.mock('onnxruntime-web', () => ({
  init: jest.fn().mockResolvedValue(undefined),
  InferenceSession: {
    create: jest.fn().mockResolvedValue({
      run: jest.fn().mockResolvedValue({
        output: {
          data: new Float32Array([1, 2, 3]),
        },
      }),
    }),
  },
  Tensor: jest.fn().mockImplementation((type, data, dims) => ({
    type,
    data,
    dims,
  })),
}));

// Test version of IndexedDB
class TestIDBDatabase {
  private stores: Map<string, Map<string, ArrayBuffer>> = new Map();
  private version: number;

  constructor(version: number) {
    this.version = version;
  }

  createObjectStore(name: string): void {
    if (!this.stores.has(name)) {
      this.stores.set(name, new Map());
    }
  }

  transaction(storeNames: string | string[], mode: IDBTransactionMode = 'readonly'): TestIDBTransaction {
    return new TestIDBTransaction(this, storeNames, mode);
  }

  close(): void {}

  getStore(name: string): Map<string, ArrayBuffer> {
    return this.stores.get(name) || new Map();
  }
}

class TestIDBTransaction {
  constructor(
    private db: TestIDBDatabase,
    private storeNames: string | string[],
    private mode: IDBTransactionMode
  ) {}

  objectStore(name: string): TestIDBObjectStore {
    return new TestIDBObjectStore(this.db.getStore(name));
  }
}

class TestIDBObjectStore {
  constructor(private store: Map<string, ArrayBuffer>) {}

  get(key: string): TestIDBRequest<ArrayBuffer | null> {
    const request = new TestIDBRequest<ArrayBuffer | null>();
    setTimeout(() => {
      request.result = this.store.get(key) || null;
      request.onsuccess?.({ target: request });
    }, 0);
    return request;
  }

  put(value: ArrayBuffer, key: string): TestIDBRequest<string> {
    const request = new TestIDBRequest<string>();
    setTimeout(() => {
      this.store.set(key, value);
      request.result = key;
      request.onsuccess?.({ target: request });
    }, 0);
    return request;
  }
}

class TestIDBRequest<T> {
  onsuccess: ((event: { target: TestIDBRequest<T> }) => void) | null = null;
  onerror: ((event: { target: TestIDBRequest<T> }) => void) | null = null;
  result: T | null = null;
  error: Error | null = null;
}

class TestIDBOpenDBRequest extends TestIDBRequest<TestIDBDatabase> {
  onupgradeneeded: ((event: { target: TestIDBOpenDBRequest }) => void) | null = null;
}

// Set up IndexedDB in test environment
const indexedDB = {
  open: (name: string, version: number): TestIDBOpenDBRequest => {
    const request = new TestIDBOpenDBRequest();
    const db = new TestIDBDatabase(version);
    
    setTimeout(() => {
      request.result = db;
      if (version > 1) {
        request.onupgradeneeded?.({ target: request });
      }
      request.onsuccess?.({ target: request });
    }, 0);
    
    return request;
  },
};

global.indexedDB = indexedDB as unknown as typeof window.indexedDB;
global.IDBDatabase = TestIDBDatabase as unknown as typeof window.IDBDatabase;
global.IDBOpenDBRequest = TestIDBOpenDBRequest as unknown as typeof window.IDBOpenDBRequest;

describe('OfflineInference', () => {
  let inference: OfflineInference;
  const mockModelPath = 'test-model.onnx';
  const mockBuffer = new ArrayBuffer(8);

  beforeEach(() => {
    jest.clearAllMocks();
    inference = new OfflineInference(mockModelPath);
  });

  it('should load model and create inference session', async () => {
    // Mock IndexedDB to return the model buffer directly
    // This simulates a model already in the cache
    const mockGetFromIndexedDB = jest.spyOn(inference as any, 'getFromIndexedDB')
      .mockResolvedValue(mockBuffer);
    
    // Mock fetch as a fallback, but it shouldn't be called
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: jest.fn().mockResolvedValue(mockBuffer),
    });

    await inference.loadModel();
    
    // Verify that InferenceSession.create was called with the buffer
    expect(InferenceSession.create).toHaveBeenCalledWith(expect.any(Uint8Array), expect.any(Object));
    
    // Verify that we got the model from IndexedDB
    expect(mockGetFromIndexedDB).toHaveBeenCalled();
    
    // Cleanup
    mockGetFromIndexedDB.mockRestore();
  });

  it('should handle network errors when loading model', async () => {
    // Mock IndexedDB to return null (no cached model)
    jest.spyOn(inference as any, 'getFromIndexedDB').mockResolvedValue(null);
    
    // Mock fetch to fail with network error
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

    // The loadModel should fail since both IndexedDB and fetch failed
    await expect(inference.loadModel()).rejects.toThrow('Network error');
  });

  it('should perform inference with loaded model', async () => {
    // Mock IndexedDB to return the model buffer directly
    jest.spyOn(inference as any, 'getFromIndexedDB').mockResolvedValue(mockBuffer);
    
    // Mock fetch as a fallback, but it shouldn't be called
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: jest.fn().mockResolvedValue(mockBuffer),
    });

    // Load the model
    await inference.loadModel();

    // Test inference
    const input = new Float32Array([1, 2, 3]);
    const result = await inference.infer(input);
    expect(result).toBeDefined();
    expect(result).toEqual(new Float32Array([1, 2, 3]));
  });

  it('should throw error when inferring without loaded model', async () => {
    const input = new Float32Array([1, 2, 3]);
    await expect(inference.infer(input)).rejects.toThrow('Model not loaded');
  });
  
  it('should fetch model from network when not in IndexedDB', async () => {
    // Mock IndexedDB to return null (no cached model)
    jest.spyOn(inference as any, 'getFromIndexedDB').mockResolvedValue(null);
    
    // Mock saveToIndexedDB to avoid actual DB operations
    const mockSaveToIndexedDB = jest.spyOn(inference as any, 'saveToIndexedDB')
      .mockResolvedValue(undefined);
    
    // Mock fetch to return model buffer
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: jest.fn().mockResolvedValue(mockBuffer),
    });

    await inference.loadModel();
    
    // Verify that fetch was called
    expect(global.fetch).toHaveBeenCalledWith(mockModelPath);
    
    // Verify that the model was saved to IndexedDB
    expect(mockSaveToIndexedDB).toHaveBeenCalled();
    
    // Cleanup
    mockSaveToIndexedDB.mockRestore();
  });
}); 