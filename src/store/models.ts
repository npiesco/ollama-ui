import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { JSDOM } from 'jsdom';

interface Model {
  name: string;
  description: string;
  parameterSizes: string[];
  capabilities: string[];
  pullCount: string;
  tagCount: string;
  lastUpdated: string;
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

export const useModelsStore = create<ModelsState>()(
  persist(
    (set, get) => ({
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

            models.push({
              name,
              description,
              parameterSizes,
              capabilities,
              pullCount,
              tagCount,
              lastUpdated,
            });
          });

          set({ 
            models,
            htmlHash: newHash,
            isLoading: false
          });
        } catch (err) {
          set({ 
            error: err instanceof Error ? err.message : 'Failed to fetch models',
            isLoading: false
          });
        }
      },
    }),
    {
      name: 'models-storage',
    }
  )
); 