// src/lib/service-worker.ts
export class ServiceWorkerManager {
  private static instance: ServiceWorkerManager;
  private registration: ServiceWorkerRegistration | null = null;
  private isOnline: boolean = navigator.onLine;

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
} 