'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserContext } from '@/types/context';

interface ContextState {
  context: UserContext | null;
  setContext: (ctx: UserContext) => void;
  clear: () => void;
}

export const useContextStore = create<ContextState>()(
  persist(
    (set) => ({
      context: null,
      setContext: (ctx) => set({ context: ctx }),
      clear: () => set({ context: null }),
    }),
    {
      name: 'cognitivtype-context',
    }
  )
);
