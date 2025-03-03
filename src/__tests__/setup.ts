/**
 * This is a setup file for Jest tests.
 * It contains mock implementations of browser APIs needed for testing.
 * This file is not meant to contain any tests.
 * @jest-environment jsdom
 */

// /ollama-ui/src/__tests__/setup.ts

import '@testing-library/jest-dom';

class MockRequest {
  url: string;
  init?: RequestInit;

  constructor(input: string | Request, init?: RequestInit) {
    this.url = typeof input === 'string' ? input : input.url;
    this.init = init;
  }

  clone(): MockRequest { 
    return new MockRequest(this.url, this.init); 
  }
}

class MockResponse {
  status: number;
  headers: Headers;
  body: BodyInit | null;
  ok: boolean;

  constructor(body?: BodyInit | null, init?: ResponseInit) {
    this.status = init?.status || 200;
    this.headers = new Headers(init?.headers);
    this.body = body || null;
    this.ok = this.status >= 200 && this.status < 300;
  }

  clone(): MockResponse { 
    return new MockResponse(this.body, { 
      status: this.status, 
      headers: this.headers 
    }); 
  }

  json(): Promise<unknown> { 
    return Promise.resolve(
      typeof this.body === 'string' ? JSON.parse(this.body) : this.body
    ); 
  }
}

class MockHeaders {
  private headers: Map<string, string>;

  constructor(init?: HeadersInit) {
    this.headers = new Map();
    if (init) {
      if (Array.isArray(init)) {
        init.forEach(([key, value]) => this.set(key, value));
      } else if (init instanceof Headers) {
        Array.from(init.entries()).forEach(([key, value]) => this.set(key, value));
      } else {
        Object.entries(init).forEach(([key, value]) => this.set(key, value));
      }
    }
  }

  append(name: string, value: string): void {
    this.set(name, value);
  }

  delete(name: string): void {
    this.headers.delete(name.toLowerCase());
  }

  get(name: string): string | null {
    return this.headers.get(name.toLowerCase()) || null;
  }

  has(name: string): boolean {
    return this.headers.has(name.toLowerCase());
  }

  set(name: string, value: string): void {
    this.headers.set(name.toLowerCase(), value);
  }

  entries(): IterableIterator<[string, string]> {
    return this.headers.entries();
  }

  keys(): IterableIterator<string> {
    return this.headers.keys();
  }

  values(): IterableIterator<string> {
    return this.headers.values();
  }

  forEach(callback: (value: string, key: string, parent: Headers) => void): void {
    this.headers.forEach((value, key) => callback(value, key, this as unknown as Headers));
  }
}

// Mock fetch
global.fetch = jest.fn((url: string, init?: RequestInit) => {
  // Parse URL to get port number
  const urlObj = new URL(url);
  const port = parseInt(urlObj.port);

  // Add headers from init if provided
  const headers = new Headers({
    'content-type': 'application/json',
    ...(init?.headers || {})
  });

  // Simulate connection refused for closed server
  if (port === 11434 && process.env.MOCK_SERVER_DOWN) {
    return Promise.reject(new Error('connect ECONNREFUSED 127.0.0.1:11434'));
  }

  // Handle custom port server
  if (port === 11435) {
    return Promise.resolve(new MockResponse(
      JSON.stringify({ version: '0.2.0' }),
      { 
        status: 200,
        headers
      }
    ));
  }

  // Handle default server
  if (port === 11434) {
    if (process.env.MOCK_SERVER_ERROR) {
      return Promise.resolve(new MockResponse(
        '',
        { status: 500, headers }
      ));
    }
    return Promise.resolve(new MockResponse(
      JSON.stringify({ version: '0.1.0' }),
      { 
        status: 200,
        headers
      }
    ));
  }

  // Default error case
  return Promise.resolve(new MockResponse(
    '',
    { status: 500, headers }
  ));
}) as jest.Mock;

// Mock NextResponse.json
jest.mock('next/server', () => ({
  ...jest.requireActual('next/server'),
  NextResponse: {
    json: (body: unknown, init?: ResponseInit) => {
      const jsonString = JSON.stringify(body);
      const response = new MockResponse(jsonString, {
        ...init,
        headers: {
          ...init?.headers,
          'content-type': 'application/json',
        },
      });
      
      // Set status based on init parameter
      response.status = init?.status || 200;
      
      return response;
    },
  },
}));

// Define interfaces for mock classes
interface MockFormDataConstructor {
  new(): FormData;
}

interface MockBlobConstructor {
  new(): Blob;
}

interface MockFileConstructor {
  new(): File;
}

interface MockStreamConstructor {
  new(): unknown;
}

interface MockTextEncoderConstructor {
  new(): TextEncoder;
}

interface MockTextDecoderConstructor {
  new(): TextDecoder;
}

global.Request = MockRequest as unknown as typeof Request;
global.Response = MockResponse as unknown as typeof Response;
global.Headers = MockHeaders as unknown as typeof Headers;

// Mock other web APIs with proper types
global.FormData = class MockFormData {} as unknown as MockFormDataConstructor;
global.Blob = class MockBlob {} as unknown as MockBlobConstructor;
global.File = class MockFile {} as unknown as MockFileConstructor;
global.ReadableStream = class MockReadableStream {} as unknown as MockStreamConstructor;
global.WritableStream = class MockWritableStream {} as unknown as MockStreamConstructor;
global.TransformStream = class MockTransformStream {} as unknown as MockStreamConstructor;
global.TextEncoder = class MockTextEncoder {} as unknown as MockTextEncoderConstructor;
global.TextDecoder = class MockTextDecoder {} as unknown as MockTextDecoderConstructor;

// Mock crypto
global.crypto = {
  subtle: {},
  getRandomValues: () => new Uint8Array(32)
} as Crypto;

export {}; 