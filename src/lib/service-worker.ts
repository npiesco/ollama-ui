// src/lib/service-worker.ts
import { OfflineInference } from './wasm/offline-inference';

interface ModelData {
  name: string;
  size: number;
  path?: string;
  metadata?: Record<string, unknown>;
}

interface CachedModel {
  data: ModelData;
  timestamp: number;
}

export class ServiceWorkerManager {
  private static instance: ServiceWorkerManager;
  private registration: ServiceWorkerRegistration | null = null;
  private isOnline: boolean = navigator.onLine;
  private offlineInference: OfflineInference | null = null;
  private modelCache: Map<string, CachedModel> = new Map();

  private constructor() {
    this.setupNetworkListeners();
  }

  static getInstance(): ServiceWorkerManager {
    if (!ServiceWorkerManager.instance) {
      ServiceWorkerManager.instance = new ServiceWorkerManager();
    }
    return ServiceWorkerManager.instance;
  }

  private setupNetworkListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifyStatusChange();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyStatusChange();
    });
  }

  private notifyStatusChange() {
    if (this.registration?.active) {
      this.registration.active.postMessage({
        type: 'NETWORK_STATUS',
        isOnline: this.isOnline
      });
    }
  }

  async register() {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker is not supported in this browser');
      return;
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered successfully:', this.registration);
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }

  async unregister() {
    if (this.registration) {
      await this.registration.unregister();
      this.registration = null;
    }
  }

  isRegistered(): boolean {
    return !!this.registration;
  }

  getRegistration(): ServiceWorkerRegistration | null {
    return this.registration;
  }

  getOnlineStatus(): boolean {
    return this.isOnline;
  }

  // Model caching methods
  async cacheModel(modelId: string, modelData: ModelData) {
    if (!this.isOnline) {
      console.warn('Cannot cache model while offline');
      return;
    }

    this.modelCache.set(modelId, {
      data: modelData,
      timestamp: Date.now()
    });

    if (this.registration?.active) {
      this.registration.active.postMessage({
        type: 'CACHE_MODEL',
        modelId,
        modelData
      });
    }
  }

  async getCachedModel(modelId: string): Promise<CachedModel | null> {
    return this.modelCache.get(modelId) || null;
  }

  // Offline inference methods
  async initializeOfflineInference(modelPath: string) {
    if (!this.offlineInference) {
      this.offlineInference = new OfflineInference(modelPath);
      await this.offlineInference.loadModel();
    }
  }

  async performOfflineInference(input: Float32Array): Promise<Float32Array> {
    if (!this.offlineInference) {
      throw new Error('Offline inference not initialized');
    }
    return this.offlineInference.infer(input);
  }

  // Cleanup methods
  async clearModelCache() {
    this.modelCache.clear();
    if (this.registration?.active) {
      this.registration.active.postMessage({
        type: 'CLEAR_MODEL_CACHE'
      });
    }
  }

  async cleanup() {
    await this.clearModelCache();
    this.offlineInference = null;
  }
} 