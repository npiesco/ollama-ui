import { api } from '@/lib/api';
import { config } from '@/lib/config';
import type { Message } from '@/store/chat';

// Mock fetch globally
global.fetch = jest.fn();

describe('API', () => {
  const mockResponse = { ok: true, json: () => Promise.resolve({}) };
  const mockErrorResponse = { ok: false, text: () => Promise.resolve('API Error') };

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockReset();
  });

  describe('fetchApi', () => {
    it('makes request with correct URL and headers', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);
      
      await api.listModels();
      
      expect(global.fetch).toHaveBeenCalledWith(
        `${config.OLLAMA_API_HOST}/api/tags`,
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('handles successful response', async () => {
      const mockData = { models: [{ name: 'test' }] };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ...mockResponse,
        json: () => Promise.resolve(mockData),
      });
      
      const result = await api.listModels();
      
      expect(result).toEqual(mockData);
    });

    it('handles error response', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockErrorResponse);
      
      await expect(api.listModels()).rejects.toThrow('API Error');
    });
  });

  describe('chat', () => {
    it('makes chat request with correct body', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);
      
      const chatBody = {
        model: 'test-model',
        messages: [{ role: 'user' as const, content: 'Hello' }],
        stream: false,
      };
      
      await api.chat(chatBody);
      
      expect(global.fetch).toHaveBeenCalledWith(
        `${config.OLLAMA_API_HOST}/api/chat`,
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(chatBody),
        })
      );
    });
  });

  describe('models', () => {
    it('lists models', async () => {
      const mockModels = [{ name: 'test', modelfile: 'test' }];
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ...mockResponse,
        json: () => Promise.resolve(mockModels),
      });
      
      const result = await api.listModels();
      
      expect(result).toEqual(mockModels);
    });

    it('pulls model', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);
      
      await api.pullModel('test-model');
      
      expect(global.fetch).toHaveBeenCalledWith(
        `${config.OLLAMA_API_HOST}/api/pull`,
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: 'test-model' }),
        })
      );
    });

    it('deletes model', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);
      
      await api.deleteModel('test-model');
      
      expect(global.fetch).toHaveBeenCalledWith(
        `${config.OLLAMA_API_HOST}/api/delete`,
        expect.objectContaining({
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: 'test-model' }),
        })
      );
    });

    it('creates model', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);
      
      const createBody = {
        name: 'test-model',
        modelfile: 'FROM test',
      };
      
      await api.createModel(createBody);
      
      expect(global.fetch).toHaveBeenCalledWith(
        `${config.OLLAMA_API_HOST}/api/create`,
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(createBody),
        })
      );
    });

    it('copies model', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);
      
      const copyBody = {
        source: 'source-model',
        destination: 'dest-model',
      };
      
      await api.copyModel(copyBody);
      
      expect(global.fetch).toHaveBeenCalledWith(
        `${config.OLLAMA_API_HOST}/api/copy`,
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(copyBody),
        })
      );
    });
  });

  describe('blobs', () => {
    it('lists blobs', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);
      
      await api.listBlobs();
      
      expect(global.fetch).toHaveBeenCalledWith(
        `${config.OLLAMA_API_HOST}/api/blobs`,
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );
    });

    it('deletes blob', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);
      
      await api.deleteBlob('test-digest');
      
      expect(global.fetch).toHaveBeenCalledWith(
        `${config.OLLAMA_API_HOST}/api/blobs/test-digest`,
        expect.objectContaining({
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );
    });
  });

  describe('server status', () => {
    it('checks server status successfully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);
      
      const result = await api.checkServer();
      
      expect(result).toBe(true);
    });

    it('handles server check failure', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockErrorResponse);
      
      const result = await api.checkServer();
      
      expect(result).toBe(false);
    });
  });

  describe('running models', () => {
    it('gets running models', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);
      
      await api.getRunningModels();
      
      expect(global.fetch).toHaveBeenCalledWith(
        `${config.OLLAMA_API_HOST}/api/ps`,
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );
    });
  });
}); 