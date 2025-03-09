// ollama-ui/src/lib/wasm/__tests__/offline-inference.test.ts
import { OfflineInference } from '@/lib/wasm/offline-inference';
import { InferenceSession } from 'onnxruntime-web';

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
    // Mock fetch to return model buffer
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: jest.fn().mockResolvedValue(mockBuffer),
    });

    await inference.loadModel();
    expect(InferenceSession.create).toHaveBeenCalledWith(mockBuffer, expect.any(Object));
  });

  it('should handle network errors when loading model', async () => {
    // Mock fetch to fail
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

    await expect(inference.loadModel()).rejects.toThrow('Network error');
  });

  it('should perform inference with loaded model', async () => {
    // Mock fetch to return model buffer
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: jest.fn().mockResolvedValue(mockBuffer),
    });

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
}); 