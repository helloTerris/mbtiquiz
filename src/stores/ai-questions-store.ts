'use client';

import { create } from 'zustand';
import type { PersonalizedQuestionOutput } from '@/types/ai-questions';

interface AIQuestionsState {
  /** Personalized questions keyed by chunk number */
  personalizedChunks: Record<number, PersonalizedQuestionOutput[]>;
  /** Chunks currently being generated */
  loadingChunks: Set<number>;
  /** Chunks that failed generation */
  failedChunks: Set<number>;

  setChunkQuestions: (chunk: number, questions: PersonalizedQuestionOutput[]) => void;
  setChunkLoading: (chunk: number, loading: boolean) => void;
  setChunkFailed: (chunk: number) => void;
  getPersonalizedQuestion: (chunk: number, questionId: string) => PersonalizedQuestionOutput | null;
  isChunkReady: (chunk: number) => boolean;
  isChunkLoading: (chunk: number) => boolean;
  reset: () => void;
}

export const useAIQuestionsStore = create<AIQuestionsState>()((set, get) => ({
  personalizedChunks: {},
  loadingChunks: new Set(),
  failedChunks: new Set(),

  setChunkQuestions: (chunk, questions) =>
    set((state) => {
      const newLoading = new Set(state.loadingChunks);
      newLoading.delete(chunk);
      return {
        personalizedChunks: { ...state.personalizedChunks, [chunk]: questions },
        loadingChunks: newLoading,
      };
    }),

  setChunkLoading: (chunk, loading) =>
    set((state) => {
      const newLoading = new Set(state.loadingChunks);
      if (loading) newLoading.add(chunk);
      else newLoading.delete(chunk);
      return { loadingChunks: newLoading };
    }),

  setChunkFailed: (chunk) =>
    set((state) => {
      const newLoading = new Set(state.loadingChunks);
      newLoading.delete(chunk);
      const newFailed = new Set(state.failedChunks);
      newFailed.add(chunk);
      return { loadingChunks: newLoading, failedChunks: newFailed };
    }),

  getPersonalizedQuestion: (chunk, questionId) => {
    const questions = get().personalizedChunks[chunk];
    return questions?.find((q) => q.id === questionId) ?? null;
  },

  isChunkReady: (chunk) => chunk in get().personalizedChunks,

  isChunkLoading: (chunk) => get().loadingChunks.has(chunk),

  reset: () =>
    set({
      personalizedChunks: {},
      loadingChunks: new Set(),
      failedChunks: new Set(),
    }),
}));
