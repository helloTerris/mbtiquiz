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
      version: 5,
      migrate: (persisted: unknown, version: number) => {
        const state = persisted as { context: Record<string, unknown> | null };
        if (version < 2 && state?.context) {
          state.context.workEnvironment = state.context.workEnvironment ?? 'na';
          state.context.livingSituation = state.context.livingSituation ?? 'partner-family';
          state.context.stressLevel = state.context.stressLevel ?? 'moderate';
        }
        if (version < 3 && state?.context) {
          state.context.lifeStageDetail = state.context.lifeStageDetail ?? undefined;
          state.context.workEnvironmentDetail = state.context.workEnvironmentDetail ?? undefined;
        }
        if (version < 4 && state?.context) {
          state.context.hobbies = state.context.hobbies ?? undefined;
        }
        if (version < 5 && state?.context) {
          state.context.mentalEnergy = state.context.mentalEnergy ?? 'clear';
          state.context.culturalValues = state.context.culturalValues ?? 'mixed';
        }
        return state as ContextState;
      },
    }
  )
);
