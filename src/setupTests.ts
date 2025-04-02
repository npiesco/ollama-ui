// ollama-ui/src/setupTests.ts
import React from 'react'
import '@testing-library/jest-dom'

/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

// Extend Jest matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R
      toHaveClass(className: string): R
    }
  }
}

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      pathname: '/',
    }
  },
  usePathname() {
    return '/'
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

// Mock fetch
global.fetch = jest.fn();

// Mock Request
class MockRequest {
  private _url: string;
  private _method: string;
  private _body: any;

  constructor(url: string, init?: RequestInit) {
    this._url = url;
    this._method = init?.method || 'GET';
    this._body = init?.body;
  }

  json() {
    return Promise.resolve(JSON.parse(this._body));
  }

  get method() {
    return this._method;
  }

  get url() {
    return this._url;
  }
}

// Mock Response
class MockResponse {
  private _status: number;
  private _headers: Headers;
  private _body: any;
  private _ok: boolean;

  constructor(body?: any, init?: ResponseInit) {
    this._body = body;
    this._status = init?.status || 200;
    this._headers = new Headers(init?.headers || {});
    this._ok = this._status >= 200 && this._status < 300;
  }

  json() {
    return Promise.resolve(this._body);
  }

  get status() {
    return this._status;
  }

  get headers() {
    return this._headers;
  }

  get body() {
    return this._body;
  }

  get ok() {
    return this._ok;
  }

  static json(data: any, init?: ResponseInit) {
    return new MockResponse(data, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers || {})
      }
    });
  }
}

// Mock Headers
class MockHeaders {
  private headers: Map<string, string>;

  constructor(init?: HeadersInit) {
    this.headers = new Map();
    if (init) {
      if (Array.isArray(init)) {
        init.forEach(([key, value]) => this.headers.set(key, value));
      } else if (init instanceof Headers) {
        init.forEach((value, key) => this.headers.set(key, value));
      } else {
        Object.entries(init).forEach(([key, value]) => this.headers.set(key, value));
      }
    }
  }

  get(key: string) {
    return this.headers.get(key) || null;
  }

  set(key: string, value: string) {
    this.headers.set(key, value);
  }

  has(key: string) {
    return this.headers.has(key);
  }

  delete(key: string) {
    this.headers.delete(key);
  }

  forEach(callback: (value: string, key: string) => void) {
    this.headers.forEach((value, key) => callback(value, key));
  }
}

// Add mocks to global scope
global.Request = MockRequest as any;
global.Response = MockResponse as any;
global.Headers = MockHeaders as any;

// Mock next/server
jest.mock('next/server', () => ({
  NextRequest: MockRequest,
  NextResponse: MockResponse
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock lucide-react icons globally
jest.mock('lucide-react', () => {
  const icons = [
    'Play',
    'Square',
    'ChevronUp',
    'ChevronDown',
    'Check',
    'ChevronsUpDown',
  ]
  const mockedIcons: Record<string, React.FC> = {}
  icons.forEach(icon => {
    mockedIcons[icon] = () => React.createElement('div', { 'data-testid': `${icon.toLowerCase()}-icon` }, `${icon} Icon`)
  })
  return mockedIcons
})

// Mock react-markdown
jest.mock('react-markdown', () => ({
  __esModule: true,
  default: ({ children }: { children: string }) => React.createElement('div', { 'data-testid': 'markdown' }, children),
}))

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe = jest.fn();
  disconnect = jest.fn();
  unobserve = jest.fn();
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver
});

// Mock ResizeObserver
class MockResizeObserver {
  observe = jest.fn();
  disconnect = jest.fn();
  unobserve = jest.fn();
}

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  configurable: true,
  value: MockResizeObserver
});

// Mock window.scrollTo
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: jest.fn(),
});

// Mock TextEncoder/TextDecoder
class MockTextEncoder {
  encode(input = ''): Uint8Array {
    return new Uint8Array(Buffer.from(input));
  }
}

class MockTextDecoder {
  decode(input = new Uint8Array()): string {
    return Buffer.from(input).toString();
  }
}

Object.defineProperty(window, 'TextEncoder', {
  writable: true,
  value: MockTextEncoder,
});

Object.defineProperty(window, 'TextDecoder', {
  writable: true,
  value: MockTextDecoder,
});

// Mock ReadableStream
interface ReadableStreamController<T> {
  enqueue(chunk: T): void;
  close(): void;
  error(reason?: unknown): void;
}

interface ReadableStreamSource<T> {
  start?(controller: ReadableStreamController<T>): void | Promise<void>;
}

class MockReadableStream<T> {
  constructor(source?: ReadableStreamSource<T>) {
    if (source?.start) {
      source.start({
        enqueue: () => {},
        close: () => {},
        error: () => {}
      });
    }
  }

  getReader() {
    return {
      read: () => Promise.resolve({ done: true, value: undefined }),
      releaseLock: () => {}
    };
  }

  pipeThrough<U>(): MockReadableStream<U> {
    return new MockReadableStream<U>();
  }
}

Object.defineProperty(global, 'ReadableStream', {
  writable: true,
  value: MockReadableStream
});

afterEach(() => {
  // Cleanup handled by Jest
}); 