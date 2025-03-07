/// <reference types="jest" />

declare namespace NodeJS {
  interface Global {
    jest: typeof import('@jest/globals')['jest'];
  }
}

declare const jest: typeof import('@jest/globals')['jest'];
declare const describe: typeof import('@jest/globals')['describe'];
declare const it: typeof import('@jest/globals')['it'];
declare const test: typeof import('@jest/globals')['it'];
declare const expect: typeof import('@jest/globals')['expect'];
declare const beforeAll: typeof import('@jest/globals')['beforeAll'];
declare const beforeEach: typeof import('@jest/globals')['beforeEach'];
declare const afterAll: typeof import('@jest/globals')['afterAll'];
declare const afterEach: typeof import('@jest/globals')['afterEach'];

declare namespace jest {
  interface MockedFunction<T extends (...args: any[]) => any> {
    (...args: Parameters<T>): ReturnType<T>;
    mockReturnValue: (value: ReturnType<T>) => this;
    mockResolvedValue: (value: ResolvedValue<ReturnType<T>>) => this;
    mockRejectedValue: (value: any) => this;
    mockImplementation: (fn: T) => this;
    mockClear: () => void;
  }
}

type ResolvedValue<T> = T extends Promise<infer U> ? U : T;

interface ModelData {
  name: string;
  size?: number;
  [key: string]: unknown;
} 