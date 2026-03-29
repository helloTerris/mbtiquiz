'use client';

import { useState, useEffect } from 'react';

/**
 * Guard against SSR/client hydration mismatch for Zustand persisted stores.
 * Components that read from persisted stores should only render
 * store-dependent UI after hydration is complete.
 */
export function useHydration() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return hydrated;
}
