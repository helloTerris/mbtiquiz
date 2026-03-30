'use client';

import { create } from 'zustand';
import type { PersonalizedQuestionOutput } from '@/types/ai-questions';

interface AIQuestionsState {
  /** Personalized questions keyed by chunk number */
  personalizedChunks: Record<number, PersonalizedQuestionOutput[]>;
  /** Chunk numbers currently being generated */
  loadingChunks: number[];
  /** Chunk numbers that failed generation */
  failedChunks: number[];

  setChunkQuestions: (chunk: number, questions: PersonalizedQuestionOutput[]) => void;
  setChunkLoading: (chunk: number, loading: boolean) => void;
  setChunkFailed: (chunk: number) => void;
  reset: () => void;
}

export const useAIQuestionsStore = create<AIQuestionsState>()((set) => ({
  personalizedChunks: {},
  loadingChunks: [],
  failedChunks: [],

  setChunkQuestions: (chunk, questions) =>
    set((state) => ({
      personalizedChunks: { ...state.personalizedChunks, [chunk]: questions },
      loadingChunks: state.loadingChunks.filter((c) => c !== chunk),
    })),

  setChunkLoading: (chunk, loading) =>
    set((state) => ({
      loadingChunks: loading
        ? state.loadingChunks.includes(chunk) ? state.loadingChunks : [...state.loadingChunks, chunk]
        : state.loadingChunks.filter((c) => c !== chunk),
    })),

  setChunkFailed: (chunk) =>
    set((state) => ({
      loadingChunks: state.loadingChunks.filter((c) => c !== chunk),
      failedChunks: state.failedChunks.includes(chunk) ? state.failedChunks : [...state.failedChunks, chunk],
    })),

  reset: () =>
    set({
      personalizedChunks: {},
      loadingChunks: [],
      failedChunks: [],
    }),
}));
