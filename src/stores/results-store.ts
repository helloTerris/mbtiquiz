'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { QuizResult } from '@/types/results';

interface ResultsState {
  result: QuizResult | null;
  setResult: (result: QuizResult) => void;
  clear: () => void;
}

export const useResultsStore = create<ResultsState>()(
  persist(
    (set) => ({
      result: null,
      setResult: (result) => set({ result }),
      clear: () => set({ result: null }),
    }),
    {
      name: 'cognitivtype-results',
    }
  )
);
