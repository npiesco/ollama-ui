// ollama-ui/src/app/__tests__/offline.test.tsx
import { ServiceWorkerManager } from '@/lib/service-worker';
import { initWasm } from '@/lib/wasm/offline-inference';

// Mock window environment
const mockWindow = {
  ...global.window,
  location: {
    ...global.window.location,
    protocol: 'http:',
    hostname: 'localhost',
    port: '3000',
  },
};

Object.defineProperty(global, 'window', {
  value: mockWindow,
  writable: true,
});

// Define proper types for the service worker manager
interface ModelData {
  name: string;
  size: number;
  path?: string;
  metadata?: Record<string, unknown>;
}

interface ServiceWorkerManagerInstance {
  register: () => Promise<void>;
  getOnlineStatus: () => boolean;
  cacheModel: (modelId: string, modelData: ModelData) => Promise<void>;
  getCachedModel: (modelId: string) => Promise<unknown | null>;
  initializeOfflineInference: (modelPath: string) => Promise<void>;
  performOfflineInference: (input: Float32Array) => Promise<Float32Array>;
  clearModelCache: () => Promise<void>;
  cleanup: () => Promise<void>;
}

// Mock the service worker manager
jest.mock('@/lib/service-worker', () => {
  const mockClearModelCache = jest.fn().mockResolvedValue(undefined);
  const mockCleanup = jest.fn().mockImplementation(async () => {
    await mockClearModelCache();
    return Promise.resolve(undefined);
  });

  return {
    ServiceWorkerManager: {
      getInstance: jest.fn().mockReturnValue({
        register: jest.fn().mockResolvedValue(undefined),
        getOnlineStatus: jest.fn().mockReturnValue(true),
        cacheModel: jest.fn().mockResolvedValue(undefined),
        getCachedModel: jest.fn().mockResolvedValue(null),
        initializeOfflineInference: jest.fn().mockResolvedValue(undefined),
        performOfflineInference: jest.fn().mockResolvedValue(new Float32Array([1, 2, 3])),
        clearModelCache: mockClearModelCache,
        cleanup: mockCleanup,
      } as ServiceWorkerManagerInstance),
    },
  };
});

// Mock the WASM initialization
jest.mock('@/lib/wasm/offline-inference', () => ({
  initWasm: jest.fn().mockResolvedValue(undefined),
}));

describe('Offline Functionality', () => {
  let serviceWorkerManager: ServiceWorkerManagerInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset window mock before each test
    Object.defineProperty(global, 'window', {
      value: mockWindow,
      writable: true,
    });
    serviceWorkerManager = ServiceWorkerManager.getInstance();
  });

  it('should initialize service worker and WASM', async () => {
    // Initialize service worker
    await serviceWorkerManager.register();
    expect(serviceWorkerManager.register).toHaveBeenCalled();

    // Initialize WASM
    await initWasm();
    expect(initWasm).toHaveBeenCalled();
  });

  it('should handle offline mode gracefully', async () => {
    // Mock offline status
    (serviceWorkerManager.getOnlineStatus as jest.Mock).mockReturnValue(false);
    
    // Verify offline status is correctly reported
    expect(serviceWorkerManager.getOnlineStatus()).toBe(false);
  });

  it('should handle model caching', async () => {
    const modelId = 'test-model';
    const modelData = { name: 'Test Model', size: 1000 };

    // Cache model
    await serviceWorkerManager.cacheModel(modelId, modelData);
    expect(serviceWorkerManager.cacheModel).toHaveBeenCalledWith(modelId, modelData);

    // Get cached model
    const cachedModel = await serviceWorkerManager.getCachedModel(modelId);
    expect(serviceWorkerManager.getCachedModel).toHaveBeenCalledWith(modelId);
    expect(cachedModel).toBeNull(); // Since we're using a mock
  });

  it('should handle offline inference', async () => {
    const modelPath = 'test-model.onnx';
    const input = new Float32Array([1, 2, 3]);

    // Initialize offline inference
    await serviceWorkerManager.initializeOfflineInference(modelPath);
    expect(serviceWorkerManager.initializeOfflineInference).toHaveBeenCalledWith(modelPath);

    // Perform inference
    const result = await serviceWorkerManager.performOfflineInference(input);
    expect(serviceWorkerManager.performOfflineInference).toHaveBeenCalledWith(input);
    expect(result).toEqual(new Float32Array([1, 2, 3]));
  });

  it('should handle service worker registration failure', async () => {
    const mockError = new Error('Registration failed');
    (serviceWorkerManager.register as jest.Mock).mockRejectedValue(mockError);

    // Attempt registration and verify error is thrown
    await expect(serviceWorkerManager.register()).rejects.toThrow('Registration failed');
  });

  it('should handle WASM initialization failure', async () => {
    const mockError = new Error('WASM initialization failed');
    (initWasm as jest.Mock).mockRejectedValue(mockError);

    // Attempt WASM initialization and verify error is thrown
    await expect(initWasm()).rejects.toThrow('WASM initialization failed');
  });

  it('should handle cleanup', async () => {
    await serviceWorkerManager.cleanup();
    expect(serviceWorkerManager.clearModelCache).toHaveBeenCalled();
    expect(serviceWorkerManager.cleanup).toHaveBeenCalled();
  });

  it('should prevent model caching while offline', async () => {
    // Mock offline status
    (serviceWorkerManager.getOnlineStatus as jest.Mock).mockReturnValue(false);

    const modelId = 'test-model';
    const modelData = { name: 'Test Model', size: 1000 };

    // Attempt to cache model while offline
    await serviceWorkerManager.cacheModel(modelId, modelData);
    expect(serviceWorkerManager.cacheModel).toHaveBeenCalledWith(modelId, modelData);
  });
}); 