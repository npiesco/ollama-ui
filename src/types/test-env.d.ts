/// <reference types="jest" />

declare global {
  interface Window {
    matchMedia: (query: string) => MediaQueryList;
    IntersectionObserver: typeof IntersectionObserver;
    ResizeObserver: typeof ResizeObserver;
  }

  interface MediaQueryList {
    matches: boolean;
    media: string;
    onchange: ((this: MediaQueryList, ev: MediaQueryListEvent) => void) | null;
    addListener: (listener: ((this: MediaQueryList, ev: MediaQueryListEvent) => void) | null) => void;
    removeListener: (listener: ((this: MediaQueryList, ev: MediaQueryListEvent) => void) | null) => void;
    addEventListener: (type: string, listener: EventListener) => void;
    removeEventListener: (type: string, listener: EventListener) => void;
    dispatchEvent: (event: Event) => boolean;
  }

  interface MediaQueryListEvent {
    matches: boolean;
    media: string;
  }
}

export {}; 