// src/__tests__/api/models.test.ts
import { GET } from '@/app/api/models/route';

interface MockResponse extends Response {
  json: () => Promise<{ models: Array<{ name: string }> }>;
}

const createMockResponse = (status: number, data: { models?: Array<{ name: string }>, error?: string }): MockResponse => ({
  status,
  ok: status >= 200 && status < 300,
  statusText: status >= 200 && status < 300 ? 'OK' : 'Internal Server Error',
  headers: new Headers(),
  redirected: false,
  type: 'default',
  url: '',
  json: async () => data,
  clone: function() { return this; },
  body: null,
  bodyUsed: false,
  arrayBuffer: async () => new ArrayBuffer(0),
  blob: async () => new Blob(),
  formData: async () => new FormData(),
  text: async () => '',
  bytes: async () => new Uint8Array(),
} as unknown as MockResponse);

const setupTestEnv = () => {
  // Mock fetch
  const mockResponse = createMockResponse(200, { models: [] });
  const mockErrorResponse = createMockResponse(500, { error: 'Internal Server Error' });

  global.fetch = jest.fn().mockImplementation((url: string) => {
    if (url.includes('models')) {
      return Promise.resolve(mockResponse);
    }
    return Promise.resolve(mockErrorResponse);
  });

  // Mock Headers
  global.Headers = jest.fn().mockImplementation(() => ({
    append: jest.fn(),
    delete: jest.fn(),
    get: jest.fn(),
    has: jest.fn(),
    set: jest.fn(),
    forEach: jest.fn(),
    entries: jest.fn(),
    keys: jest.fn(),
    values: jest.fn(),
  }));
};

describe('Models API', () => {
  beforeEach(() => {
    setupTestEnv();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 200 and empty models array when Ollama is healthy', async () => {
    const response = await GET();
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual({ models: [] });
  });

  it('should return 500 when Ollama is not healthy', async () => {
    const errorResponse = createMockResponse(500, { error: 'Internal Server Error' });
    global.fetch = jest.fn().mockImplementation(() => Promise.resolve(errorResponse));

    const response = await GET();
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data).toEqual({ error: 'Failed to fetch models' });
  });
}); 