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
  /** Question IDs currently being refreshed */
  refreshingQuestionIds: string[];

  setChunkQuestions: (chunk: number, questions: PersonalizedQuestionOutput[]) => void;
  setChunkLoading: (chunk: number, loading: boolean) => void;
  setChunkFailed: (chunk: number) => void;
  setQuestionRefreshing: (id: string, refreshing: boolean) => void;
  updateSingleQuestion: (chunk: number, question: PersonalizedQuestionOutput) => void;
  reset: () => void;
}

export const useAIQuestionsStore = create<AIQuestionsState>()((set) => ({
  personalizedChunks: {},
  loadingChunks: [],
  failedChunks: [],
  refreshingQuestionIds: [],

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

  setQuestionRefreshing: (id, refreshing) =>
    set((state) => ({
      refreshingQuestionIds: refreshing
        ? state.refreshingQuestionIds.includes(id) ? state.refreshingQuestionIds : [...state.refreshingQuestionIds, id]
        : state.refreshingQuestionIds.filter((qid) => qid !== id),
    })),

  updateSingleQuestion: (chunk, question) =>
    set((state) => {
      const existing = state.personalizedChunks[chunk] ?? [];
      const updated = existing.some((q) => q.id === question.id)
        ? existing.map((q) => (q.id === question.id ? question : q))
        : [...existing, question];
      return {
        personalizedChunks: { ...state.personalizedChunks, [chunk]: updated },
      };
    }),

  reset: () =>
    set({
      personalizedChunks: {},
      loadingChunks: [],
      failedChunks: [],
      refreshingQuestionIds: [],
    }),
}));
