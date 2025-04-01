'use client';

import { useEffect, useState } from 'react';

import { useChatStore } from '@/store/chat';

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    useChatStore.persist.rehydrate();
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return null; // or a loading spinner
  }

  return children;
} 