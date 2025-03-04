// ollama-ui/src/lib/__tests__/service-worker.test.ts
import { ServiceWorkerManager } from '../service-worker';

// Mock the navigator.serviceWorker
const mockRegister = jest.fn();
const mockUnregister = jest.fn();
const mockRegistration = {
  active: {
    postMessage: jest.fn(),
  },
  unregister: mockUnregister,
};

Object.defineProperty(navigator, 'serviceWorker', {
  value: {
    register: mockRegister,
  },
  writable: true,
});

describe('ServiceWorkerManager', () => {
  let manager: ServiceWorkerManager;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Reset singleton instance
    (ServiceWorkerManager as { instance: ServiceWorkerManager | null }).instance = null;
    
    // Create new instance
    manager = ServiceWorkerManager.getInstance();
  });

  it('should be a singleton', () => {
    const instance1 = ServiceWorkerManager.getInstance();
    const instance2 = ServiceWorkerManager.getInstance();
    expect(instance1).toBe(instance2);
  });

  it('should initialize with correct online status', () => {
    expect(manager.getOnlineStatus()).toBe(navigator.onLine);
  });

  it('should handle online/offline events', () => {
    // Mock online event
    window.dispatchEvent(new Event('online'));
    expect(manager.getOnlineStatus()).toBe(true);

    // Mock offline event
    window.dispatchEvent(new Event('offline'));
    expect(manager.getOnlineStatus()).toBe(false);
  });

  it('should register service worker', async () => {
    mockRegister.mockResolvedValueOnce(mockRegistration);
    
    await manager.register();
    
    expect(mockRegister).toHaveBeenCalledWith('/sw.js');
    expect(manager.isRegistered()).toBe(true);
  });

  it('should handle registration failure', async () => {
    mockRegister.mockRejectedValueOnce(new Error('Registration failed'));
    
    await manager.register();
    
    expect(mockRegister).toHaveBeenCalledWith('/sw.js');
    expect(manager.isRegistered()).toBe(false);
  });

  it('should unregister service worker', async () => {
    mockRegister.mockResolvedValueOnce(mockRegistration);
    mockUnregister.mockResolvedValueOnce(undefined);
    
    await manager.register();
    await manager.unregister();
    
    expect(mockUnregister).toHaveBeenCalled();
    expect(manager.isRegistered()).toBe(false);
  });
}); 