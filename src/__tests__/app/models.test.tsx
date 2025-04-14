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

// Sample HTML content from ollama.com/library that matches the actual structure
const sampleLibraryHtml = `
<!DOCTYPE html>
<html>
<body>
  <ul>
    <li x-test-model>
      <div x-test-model-title title="llama3">Llama 3</div>
      <div class="text-neutral-800">Meta Llama 3: The most capable openly available LLM to date</div>
      <div>
        <span x-test-size>8b</span>
        <span x-test-size>70b</span>
      </div>
      <div>
        <span x-test-capability>tools</span>
      </div>
      <div>
        <span x-test-pull-count>89.8M</span>
        <span x-test-tag-count>93</span>
        <span x-test-updated>4 months ago</span>
      </div>
    </li>
    <li x-test-model>
      <div x-test-model-title title="mistral">Mistral</div>
      <div class="text-neutral-800">The 7B model released by Mistral AI, updated to version 0.3.</div>
      <div>
        <span x-test-size>7b</span>
      </div>
      <div>
        <span x-test-capability>tools</span>
      </div>
      <div>
        <span x-test-pull-count>11.7M</span>
        <span x-test-tag-count>84</span>
        <span x-test-updated>8 months ago</span>
      </div>
    </li>
    <li x-test-model>
      <div x-test-model-title title="nomic-embed-text">Nomic Embed Text</div>
      <div class="text-neutral-800">A high-performing open embedding model with a large token context window.</div>
      <div>
      </div>
      <div>
        <span x-test-capability>embedding</span>
      </div>
      <div>
        <span x-test-pull-count>22.2M</span>
        <span x-test-tag-count>3</span>
        <span x-test-updated>13 months ago</span>
      </div>
    </li>
  </ul>
</body>
</html>
`

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

// We don't need this helper function anymore since we're using sample HTML


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
  
  it('should parse models from the Ollama website HTML', async () => {
    // Mock the fetch to return our sample HTML
    mockFetch.mockImplementation((url: string) => {
      if (url === 'https://ollama.com/library') {
        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve(sampleLibraryHtml)
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
    
    // Call fetchModels to process the HTML
    await act(async () => {
      await useModelsStore.getState().fetchModels();
    });
    
    // Verify models were parsed from the HTML
    const { models } = useModelsStore.getState();
    expect(models.length).toBeGreaterThan(0);
    
    // Parse the HTML to verify model elements
    const dom = new JSDOM(sampleLibraryHtml);
    const document = dom.window.document;
    const modelElements = document.querySelectorAll('li[x-test-model]');
    
    // Verify the number of models matches
    expect(models.length).toBe(modelElements.length);
    
    // Check the models to verify parsing
    expect(models.length).toBe(3); // We have 3 models in our sample
    
    // Check llama3 model
    const llama3 = models.find(m => m.name === 'llama3');
    expect(llama3).toBeDefined();
    expect(llama3?.description).toBe('Meta Llama 3: The most capable openly available LLM to date');
    expect(llama3?.parameterSizes).toEqual(['8b', '70b']);
    expect(llama3?.capabilities).toEqual(['tools']);
    expect(llama3?.pullCount).toBe('89.8M');
    expect(llama3?.tagCount).toBe('93');
    expect(llama3?.lastUpdated).toBe('4 months ago');
    
    // Check nomic-embed-text model (embedding model)
    const nomic = models.find(m => m.name === 'nomic-embed-text');
    expect(nomic).toBeDefined();
    expect(nomic?.capabilities).toEqual(['embedding']);
    expect(nomic?.parameterSizes).toEqual([]);
  })
  
  it('should extract model details correctly from HTML', async () => {
    // Mock the fetch to return our sample HTML
    mockFetch.mockImplementation((url: string) => {
      if (url === 'https://ollama.com/library') {
        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve(sampleLibraryHtml)
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
    const dom = new JSDOM(sampleLibraryHtml);
    const document = dom.window.document;
    const modelElements = document.querySelectorAll('li[x-test-model]');
    
    // Get the model names to verify
    const modelNames = Array.from(modelElements).map(el => 
      el.querySelector('[x-test-model-title]')?.getAttribute('title')
    ).filter(Boolean);
    
    expect(modelNames).toContain('llama3');
    expect(modelNames).toContain('mistral');
    expect(modelNames).toContain('nomic-embed-text');
    
    // Now use the store's fetchModels function
    await act(async () => {
      await useModelsStore.getState().fetchModels();
    });
    
    // Get the models from the store
    const { models } = useModelsStore.getState();
    
    // Verify models were parsed
    expect(models.length).toBe(3);
    
    // Check the mistral model details
    const mistral = models.find(m => m.name === 'mistral');
    expect(mistral).toBeDefined();
    expect(mistral?.description).toBe('The 7B model released by Mistral AI, updated to version 0.3.');
    expect(mistral?.parameterSizes).toEqual(['7b']);
    expect(mistral?.capabilities).toEqual(['tools']);
    expect(mistral?.pullCount).toBe('11.7M');
    expect(mistral?.tagCount).toBe('84');
    expect(mistral?.lastUpdated).toBe('8 months ago');
  });
  
  it('should handle error when Ollama API is unreachable', async () => {
    // Mock successful HTML fetch but failed API fetch
    mockFetch.mockImplementation((url: string) => {
      if (url === 'https://ollama.com/library') {
        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve(sampleLibraryHtml)
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
    expect(models.length).toBe(3);
    
    // But all models should be marked as not installed
    expect(models.every(model => !model.isInstalled)).toBe(true);
  });
  
  it('should update UI with model data from HTML', async () => {
    // Mock successful HTML fetch
    mockFetch.mockImplementation((url: string) => {
      if (url === 'https://ollama.com/library') {
        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve(sampleLibraryHtml)
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
    expect(models.length).toBe(3);
    
    // Check if models are displayed in the UI
    expect(screen.getByText('llama3')).toBeInTheDocument();
    expect(screen.getByText('mistral')).toBeInTheDocument();
    expect(screen.getByText('nomic-embed-text')).toBeInTheDocument();
    
    // Check if descriptions are displayed
    expect(screen.getByText('Meta Llama 3: The most capable openly available LLM to date')).toBeInTheDocument();
    expect(screen.getByText('The 7B model released by Mistral AI, updated to version 0.3.')).toBeInTheDocument();
    expect(screen.getByText('A high-performing open embedding model with a large token context window.')).toBeInTheDocument();
  });
  
  it('should verify model installation status correctly', async () => {
    // Mock successful HTML fetch and API response
    mockFetch.mockImplementation((url: string) => {
      if (url === 'https://ollama.com/library') {
        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve(sampleLibraryHtml)
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
    
    // Verify specific models installation status
    const llama3 = models.find(m => m.name === 'llama3');
    const mistral = models.find(m => m.name === 'mistral');
    const nomic = models.find(m => m.name === 'nomic-embed-text');
    
    expect(llama3?.isInstalled).toBe(true);
    expect(mistral?.isInstalled).toBe(true);
    expect(nomic?.isInstalled).toBe(false);
  })
});


