declare module 'jsonwebtoken' {
  interface JwtPayload {
    userId: string;
    email: string;
    iat?: number;
    exp?: number;
  }

  export function sign(payload: JwtPayload, secret: string, options?: SignOptions): string;
  export function verify(token: string, secret: string): JwtPayload;

  export interface SignOptions {
    algorithm?: string;
    expiresIn?: string | number;
    notBefore?: string | number;
    audience?: string | string[];
    issuer?: string;
    jwtid?: string;
    subject?: string;
    noTimestamp?: boolean;
    header?: object;
    keyid?: string;
    mutatePayload?: boolean;
  }

  export interface VerifyOptions {
    algorithms?: string[];
    audience?: string | RegExp | Array<string | RegExp>;
    clockTimestamp?: number;
    clockTolerance?: number;
    complete?: boolean;
    issuer?: string | string[];
    ignoreExpiration?: boolean;
    ignoreNotBefore?: boolean;
    jwtid?: string;
    nonce?: string;
    subject?: string;
    maxAge?: string | number;
  }
} 