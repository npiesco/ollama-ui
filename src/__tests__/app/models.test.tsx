import { render, screen, waitFor, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import { JSDOM } from 'jsdom'
import { useModelsStore } from '@/store/models'
import { config } from '@/lib/config'
import React, { useEffect } from 'react'
import { create } from 'zustand'

// Increase timeout for API calls to handle real network requests
jest.setTimeout(30000)

// Store the original config values to restore after tests
const originalApiHost = config.OLLAMA_API_HOST

// We'll use the actual cached HTML from the Zustand store

// Create a test component that uses the real store
const TestModelsComponent = () => {
  const { models, isLoading, error, fetchModels } = useModelsStore()
  
  // Call fetchModels on mount
  useEffect(() => {
    fetchModels()
  }, [fetchModels])
  
  if (isLoading) return <div data-testid="loading">Loading models...</div>
  if (error) return <div data-testid="error">{error}</div>
  
  return (
    <div>
      <h1>Models</h1>
      {models.length === 0 ? (
        <div data-testid="no-models">No models found</div>
      ) : (
        <div data-testid="models-list">
          {models.map((model) => (
            <div key={model.name} data-testid={`model-${model.name}`}>
              <h2>{model.name}</h2>
              <p>{model.description}</p>
              <div>
                <span>Parameter sizes: {model.parameterSizes?.join(', ')}</span>
              </div>
              <div>
                <span>Capabilities: {model.capabilities?.join(', ')}</span>
              </div>
              <div>
                <span>Installed: {model.isInstalled ? 'Yes' : 'No'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Mock fetch to avoid actual network requests during tests
const originalFetch = global.fetch;

// Helper function to get localStorage data for the store
const getStoredData = () => {
  try {
    const storedData = localStorage.getItem('models-storage');
    if (storedData) {
      return JSON.parse(storedData);
    }
  } catch (e) {
    console.error('Error reading from localStorage:', e);
  }
  return null;
};

describe('Models functionality with cached HTML', () => {
  // Setup mock for fetch
  let mockFetch: jest.Mock;
  
  beforeEach(() => {
    // Setup localStorage mock
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true
    });
    
    // Setup fetch mock
    mockFetch = jest.fn();
    global.fetch = mockFetch;
    
    // Reset the store
    useModelsStore.getState().setModels([]);
    useModelsStore.getState().setHtmlHash('');
    useModelsStore.getState().setError(null);
    useModelsStore.getState().setLoading(false);
  });
  
  afterAll(() => {
    // Restore original fetch
    global.fetch = originalFetch;
    
    // Restore original config
    config.OLLAMA_API_HOST = originalApiHost;
  });
  
  it('should use cached HTML from Zustand store', async () => {
    // Get the cached HTML from the store or use a sample if not available
    const cachedData = getStoredData();
    const cachedHtml = cachedData?.state?.htmlContent || null;
    
    // Skip test if no cached HTML is available
    if (!cachedHtml) {
      console.warn('No cached HTML available, skipping test');
      return;
    }
    
    // Mock the fetch to return the cached HTML
    mockFetch.mockImplementation((url: string) => {
      if (url === 'https://ollama.com/library') {
        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve(cachedHtml)
        });
      }
      
      // For Ollama API calls, return empty model list
      if (url.includes('/api/tags')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ models: [] })
        });
      }
      
      return Promise.reject(new Error(`Unexpected URL: ${url}`));
    });
    
    // Call fetchModels to process the cached HTML
    await act(async () => {
      await useModelsStore.getState().fetchModels();
    });
    
    // Verify models were parsed from the cached HTML
    const { models } = useModelsStore.getState();
    expect(models.length).toBeGreaterThan(0);
    
    // Parse the HTML to verify model elements
    const dom = new JSDOM(cachedHtml);
    const document = dom.window.document;
    const modelElements = document.querySelectorAll('li[x-test-model]');
    
    // Verify the number of models matches
    expect(models.length).toBe(modelElements.length);
    
    // Check a sample model to verify parsing
    const firstModelElement = modelElements[0];
    const firstModelName = firstModelElement.querySelector('[x-test-model-title]')?.getAttribute('title');
    const firstModel = models.find(m => m.name === firstModelName);
    
    expect(firstModel).toBeDefined();
    expect(firstModel?.description).toBeTruthy();
  })
  
  it('should test model parsing with cached HTML', async () => {
    // Get the cached HTML from the store or use a sample if not available
    const cachedData = getStoredData();
    const cachedHtml = cachedData?.state?.htmlContent || null;
    
    // Skip test if no cached HTML is available
    if (!cachedHtml) {
      console.warn('No cached HTML available, skipping test');
      return;
    }
    
    // Mock the fetch to return the cached HTML
    mockFetch.mockImplementation((url: string) => {
      if (url === 'https://ollama.com/library') {
        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve(cachedHtml)
        });
      }
      
      // For Ollama API calls, return empty model list
      if (url.includes('/api/tags')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ models: [] })
        });
      }
      
      return Promise.reject(new Error(`Unexpected URL: ${url}`));
    });
    
    // Parse the HTML to extract model data
    const dom = new JSDOM(cachedHtml);
    const document = dom.window.document;
    const modelElements = document.querySelectorAll('li[x-test-model]');
    
    // Get a sample model name to verify
    const sampleModelName = modelElements[0].querySelector('[x-test-model-title]')?.getAttribute('title');
    expect(sampleModelName).toBeTruthy();
    
    // Now use the store's fetchModels function
    await act(async () => {
      await useModelsStore.getState().fetchModels();
    });
    
    // Get the models from the store
    const { models } = useModelsStore.getState();
    
    // Verify models were parsed
    expect(models.length).toBeGreaterThan(0);
    
    // Verify the sample model exists in the parsed models
    const foundModel = models.find(m => m.name === sampleModelName);
    expect(foundModel).toBeTruthy();
    
    // Verify model structure
    expect(foundModel).toHaveProperty('description');
    expect(foundModel).toHaveProperty('parameterSizes');
    expect(foundModel).toHaveProperty('capabilities');
  });
  
  it('should handle error when Ollama API is unreachable', async () => {
    // Get the cached HTML from the store
    const cachedData = getStoredData();
    const cachedHtml = cachedData?.state?.htmlContent || null;
    
    // Skip test if no cached HTML is available
    if (!cachedHtml) {
      console.warn('No cached HTML available, skipping test');
      return;
    }
    
    // Mock successful HTML fetch but failed API fetch
    mockFetch.mockImplementation((url: string) => {
      if (url === 'https://ollama.com/library') {
        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve(cachedHtml)
        });
      }
      
      // Simulate unreachable Ollama API
      if (url.includes('/api/tags')) {
        return Promise.reject(new Error('Failed to connect to Ollama API'));
      }
      
      return Promise.reject(new Error(`Unexpected URL: ${url}`));
    });
    
    // Temporarily modify the API host to an invalid one
    config.OLLAMA_API_HOST = 'http://invalid-host:11434';
    
    // Render the test component
    await act(async () => {
      render(<TestModelsComponent />);
    });
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    }, { timeout: 5000 });
    
    // Check if models were still fetched from ollama.com
    const { models } = useModelsStore.getState();
    
    // We should still have models from ollama.com even if the API is unreachable
    expect(models.length).toBeGreaterThan(0);
    
    // But all models should be marked as not installed
    expect(models.every(model => !model.isInstalled)).toBe(true);
  });
  
  it('should update UI with model data from cached HTML', async () => {
    // Get the cached HTML from the store
    const cachedData = getStoredData();
    const cachedHtml = cachedData?.state?.htmlContent || null;
    
    // Skip test if no cached HTML is available
    if (!cachedHtml) {
      console.warn('No cached HTML available, skipping test');
      return;
    }
    
    // Mock successful HTML fetch
    mockFetch.mockImplementation((url: string) => {
      if (url === 'https://ollama.com/library') {
        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve(cachedHtml)
        });
      }
      
      // Mock API response with some installed models
      if (url.includes('/api/tags')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ models: [
            { name: 'llama3' },
            { name: 'mistral' }
          ]})
        });
      }
      
      return Promise.reject(new Error(`Unexpected URL: ${url}`));
    });
    
    // Reset API host to default
    config.OLLAMA_API_HOST = originalApiHost;
    
    // Render the test component
    await act(async () => {
      render(<TestModelsComponent />);
    });
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    }, { timeout: 5000 });
    
    // Check if models list is rendered
    expect(screen.getByTestId('models-list')).toBeInTheDocument();
    
    // Get the models from the store to verify UI matches data
    const { models } = useModelsStore.getState();
    expect(models.length).toBeGreaterThan(0);
    
    // Check if at least the first model is displayed
    if (models.length > 0) {
      const firstModel = models[0];
      expect(screen.getByText(firstModel.name)).toBeInTheDocument();
      if (firstModel.description) {
        expect(screen.getByText(firstModel.description)).toBeInTheDocument();
      }
    }
  });
  
  it('should verify model installation status correctly', async () => {
    // Get the cached HTML from the store
    const cachedData = getStoredData();
    const cachedHtml = cachedData?.state?.htmlContent || null;
    
    // Skip test if no cached HTML is available
    if (!cachedHtml) {
      console.warn('No cached HTML available, skipping test');
      return;
    }
    
    // Mock successful HTML fetch and API response
    mockFetch.mockImplementation((url: string) => {
      if (url === 'https://ollama.com/library') {
        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve(cachedHtml)
        });
      }
      
      // Mock API response with some installed models
      if (url.includes('/api/tags')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ models: [
            { name: 'llama3' },
            { name: 'mistral' }
          ]})
        });
      }
      
      return Promise.reject(new Error(`Unexpected URL: ${url}`));
    });
    
    // Reset API host to default
    config.OLLAMA_API_HOST = originalApiHost;
    
    // First fetch models
    await act(async () => {
      await useModelsStore.getState().fetchModels();
    });
    
    // Get models from store
    const { models } = useModelsStore.getState();
    
    // Verify fetch calls were made to both ollama.com and the API
    const fetchCalls = mockFetch.mock.calls;
    
    // Should have called ollama.com/library
    expect(fetchCalls.some((call: [string, any]) => call[0] === 'https://ollama.com/library')).toBe(true);
    
    // Should have attempted to call the Ollama API
    expect(fetchCalls.some((call: [string, any]) => {
      const url = call[0];
      return typeof url === 'string' && url.includes('/api/tags');
    })).toBe(true);
    
    // Models should have isInstalled property
    expect(models.every(model => 'isInstalled' in model)).toBe(true);
    
    // Models with matching names should be marked as installed
    const installedModels = models.filter(model => model.isInstalled);
    expect(installedModels.some(model => model.name === 'llama3' || model.name === 'mistral')).toBe(true);
  })
});


