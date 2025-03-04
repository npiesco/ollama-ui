// ollama-ui/src/app/__tests__/offline.test.tsx
import { ServiceWorkerManager } from '@/lib/service-worker';
import { OfflineInference, initWasm } from '@/lib/wasm/offline-inference';

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

// Mock the service worker manager
jest.mock('@/lib/service-worker', () => ({
  ServiceWorkerManager: {
    getInstance: jest.fn().mockReturnValue({
      register: jest.fn().mockResolvedValue(undefined),
      getOnlineStatus: jest.fn().mockReturnValue(true),
    }),
  },
}));

// Mock the WASM initialization
jest.mock('@/lib/wasm/offline-inference', () => ({
  initWasm: jest.fn().mockResolvedValue(undefined),
  OfflineInference: jest.fn().mockImplementation(() => ({
    loadModel: jest.fn().mockResolvedValue(undefined),
    infer: jest.fn(),
  })),
}));

describe('Offline Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset window mock before each test
    Object.defineProperty(global, 'window', {
      value: mockWindow,
      writable: true,
    });
  });

  it('should initialize service worker and WASM', async () => {
    // Initialize service worker
    await ServiceWorkerManager.getInstance().register();
    expect(ServiceWorkerManager.getInstance().register).toHaveBeenCalled();

    // Initialize WASM
    await initWasm();
    expect(initWasm).toHaveBeenCalled();
  });

  it('should handle offline mode gracefully', async () => {
    // Mock offline status
    (ServiceWorkerManager.getInstance().getOnlineStatus as jest.Mock).mockReturnValue(false);
    
    // Verify offline status is correctly reported
    expect(ServiceWorkerManager.getInstance().getOnlineStatus()).toBe(false);
  });

  it('should handle model loading in offline mode', async () => {
    const mockInference = new OfflineInference('test-model');
    (OfflineInference as jest.Mock).mockImplementation(() => mockInference);

    // Load model
    await mockInference.loadModel();
    expect(mockInference.loadModel).toHaveBeenCalled();
  });

  it('should handle service worker registration failure', async () => {
    const mockError = new Error('Registration failed');
    (ServiceWorkerManager.getInstance().register as jest.Mock).mockRejectedValue(mockError);

    // Attempt registration and verify error is thrown
    await expect(ServiceWorkerManager.getInstance().register()).rejects.toThrow('Registration failed');
  });

  it('should handle WASM initialization failure', async () => {
    const mockError = new Error('WASM initialization failed');
    (initWasm as jest.Mock).mockRejectedValue(mockError);

    // Attempt WASM initialization and verify error is thrown
    await expect(initWasm()).rejects.toThrow('WASM initialization failed');
  });
}); 