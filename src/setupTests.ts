// ollama-ui/src/setupTests.ts
import React from 'react'
import '@testing-library/jest-dom'

/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

type MediaQueryListListener = ((this: MediaQueryList, ev: MediaQueryListEvent) => any) | null;

// Extend Jest matchers
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
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

// Mock Request and Response for Next.js API routes
class MockRequest {
  private url: string;
  private options: RequestInit;

  constructor(input: string | URL | Request, init?: RequestInit) {
    this.url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : 'http://localhost';
    this.options = init || {};
  }

  get method() {
    return this.options.method || 'GET';
  }

  async json() {
    return this.options.body ? JSON.parse(this.options.body as string) : {};
  }
}

class MockResponse {
  private body: any;
  private init: ResponseInit;

  constructor(body?: BodyInit | null, init?: ResponseInit) {
    this.body = body;
    this.init = init || {};
  }

  get ok() {
    return (this.init.status || 200) >= 200 && (this.init.status || 200) < 300;
  }

  get status() {
    return this.init.status || 200;
  }

  get headers() {
    return new Headers(this.init.headers);
  }

  async json() {
    return typeof this.body === 'string' ? JSON.parse(this.body) : this.body;
  }

  clone() {
    return new MockResponse(this.body, this.init);
  }
}

Object.defineProperty(global, 'Request', {
  writable: true,
  value: MockRequest
})

Object.defineProperty(global, 'Response', {
  writable: true,
  value: MockResponse
})

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

// Mock window.matchMedia
const createMatchMedia = (query: string): MediaQueryList => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: jest.fn(),
  removeListener: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(() => true),
});

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn(createMatchMedia),
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

// Mock window.fetch
(global as any).fetch = jest.fn(() => 
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(""),
    blob: () => Promise.resolve(new Blob()),
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    formData: () => Promise.resolve(new FormData()),
    headers: new Headers(),
    status: 200,
    statusText: "OK",
    type: "basic" as ResponseType,
    url: "",
    clone: function() { return this },
  } as Response)
);

// Mock window.matchMedia (again)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn(createMatchMedia),
}); 