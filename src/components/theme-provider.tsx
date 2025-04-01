'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from 'next-themes';

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      disableTransitionOnChange
      enableSystem
      attribute="class"
      defaultTheme="system"
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
} 