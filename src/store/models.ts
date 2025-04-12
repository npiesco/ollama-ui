import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { JSDOM } from 'jsdom';
import { StateCreator } from 'zustand';

interface Model {
  name: string;
  description: string;
  parameterSizes: string[];
  capabilities: string[];
  pullCount: string;
  tagCount: string;
  lastUpdated: string;
  isInstalled: boolean;
}

interface ModelsState {
  models: Model[];
  htmlHash: string | null;
  isLoading: boolean;
  error: string | null;
  setModels: (models: Model[]) => void;
  setHtmlHash: (hash: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchModels: () => Promise<void>;
  verifyModel: (modelName: string) => Promise<boolean>;
}

// Simple hash function for HTML content
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

type ModelsStateCreator = StateCreator<
  ModelsState,
  [],
  [['zustand/persist', ModelsState]]
>;

const createStore: ModelsStateCreator = (set, get) => ({
  models: [],
  htmlHash: null,
  isLoading: false,
  error: null,
  setModels: (models) => set({ models }),
  setHtmlHash: (hash) => set({ htmlHash: hash }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  fetchModels: async () => {
    set({ isLoading: true, error: null });

    try {
      // First get the raw HTML to check if it's changed
      const htmlResponse = await fetch('https://ollama.com/library', {
        headers: { 'Accept': 'text/html' }
      });
      if (!htmlResponse.ok) {
        throw new Error('Failed to fetch models');
      }
      const html = await htmlResponse.text();
      const newHash = hashString(html);
      const state = get();

      // If HTML hasn't changed and we have models, use cached data
      if (state.htmlHash === newHash && state.models.length > 0) {
        set({ isLoading: false });
        return;
      }

      // Get installed models from Ollama API
      let installedModelNames: string[] = [];
      try {
        const installedResponse = await fetch('http://127.0.0.1:11434/api/tags');
        if (installedResponse.ok) {
          const installedData = await installedResponse.json();
          installedModelNames = installedData.models.map((m: any) => m.name);
        }
      } catch (err) {
        console.error('Failed to fetch installed models:', err);
      }

      // HTML has changed or we don't have models, parse and update
      const dom = new JSDOM(html);
      const document = dom.window.document;
      const models: Model[] = [];

      document.querySelectorAll('li[x-test-model]').forEach((modelElement) => {
        const name = modelElement.querySelector('[x-test-model-title]')?.getAttribute('title') || '';
        const description = modelElement.querySelector('.text-neutral-800')?.textContent?.trim() || '';
        
        const parameterSizes: string[] = [];
        modelElement.querySelectorAll('[x-test-size]').forEach((sizeElement) => {
          parameterSizes.push(sizeElement.textContent?.trim() || '');
        });

        const capabilities: string[] = [];
        modelElement.querySelectorAll('[x-test-capability]').forEach((capElement) => {
          capabilities.push(capElement.textContent?.trim() || '');
        });

        const pullCount = modelElement.querySelector('[x-test-pull-count]')?.textContent?.trim() || '0';
        const tagCount = modelElement.querySelector('[x-test-tag-count]')?.textContent?.trim() || '0';
        const lastUpdated = modelElement.querySelector('[x-test-updated]')?.textContent?.trim() || '';

        if (name) {
          models.push({
            name,
            description,
            parameterSizes,
            capabilities,
            pullCount,
            tagCount,
            lastUpdated,
            isInstalled: installedModelNames.some(installedName => 
              installedName === name || installedName.startsWith(`${name}:`)
            )
          });
        }
      });

      // Update state with new models and hash
      set((state) => ({
        ...state,
        models,
        htmlHash: newHash,
        isLoading: false,
        error: null
      }));
    } catch (err) {
      set((state) => ({ 
        ...state,
        error: err instanceof Error ? err.message : 'Failed to fetch models',
        isLoading: false
      }));
    }
  },
  verifyModel: async (modelName: string) => {
    try {
      const response = await fetch(`http://127.0.0.1:11434/api/tags`);
      if (!response.ok) {
        throw new Error('Failed to verify model');
      }
      const data = await response.json();
      return data.models.some((model: any) => model.name === modelName);
    } catch (err) {
      console.error('Error verifying model:', err);
      return false;
    }
  }
});

// Only use persistence in non-test environments
const isTestEnv = process.env.NODE_ENV === 'test';

export const useModelsStore = create<ModelsState>()(
  isTestEnv
    ? ((...args) => createStore(...args))
    : persist(createStore, {
        name: 'models-storage',
      })
); 