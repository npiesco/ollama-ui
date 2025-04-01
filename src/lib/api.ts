// ollama-ui/src/lib/api.ts
import type { Message } from '@/store/chat';

import { config } from './config';

const BASE_URL = config.OLLAMA_API_HOST;

type JsonBody = Record<string, unknown>

interface FetchOptions extends Omit<RequestInit, 'body'> {
  body?: JsonBody
}

// API Response Types
interface ModelResponse {
  name: string
  modelfile: string
}

interface ChatResponse extends JsonBody {
  model: string
  messages: Message[]
  stream?: boolean
}

interface CopyModelRequest extends JsonBody {
  source: string
  destination: string
}

interface CreateModelRequest extends JsonBody {
  name: string
  modelfile: string
}

async function fetchApi(endpoint: string, options: FetchOptions = {}) {
  const url = `${BASE_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const config: RequestInit = {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'API request failed');
  }

  return response;
}

export const api = {
  // Chat
  chat: (body: ChatResponse) => fetchApi('/api/chat', { method: 'POST', body }),
  
  // Models
  listModels: () => fetchApi('/api/tags').then(res => res.json() as Promise<ModelResponse[]>),
  pullModel: (name: string) => fetchApi('/api/pull', { method: 'POST', body: { name } }),
  deleteModel: (name: string) => fetchApi('/api/delete', { method: 'DELETE', body: { name } }),
  createModel: (body: CreateModelRequest) => fetchApi('/api/create', { method: 'POST', body }),
  copyModel: (body: CopyModelRequest) => fetchApi('/api/copy', { method: 'POST', body }),
  
  // Blobs
  listBlobs: () => fetchApi('/api/blobs'),
  deleteBlob: (digest: string) => fetchApi(`/api/blobs/${digest}`, { method: 'DELETE' }),
  
  // Server Status
  checkServer: () => fetchApi('/api/tags').then(() => true).catch(() => false),
  
  // Running Models
  getRunningModels: () => fetchApi('/api/ps'),
}; 