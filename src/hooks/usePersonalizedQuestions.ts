'use client';

import { useMemo, useEffect, useRef } from 'react';
import { getQuestionsByChunk } from '@/engine/questions/question-bank';
import { adaptQuestion } from '@/engine/questions/context-adapter';
import { useContextStore } from '@/stores/context-store';
import { useAIQuestionsStore } from '@/stores/ai-questions-store';
import { mergePersonalized, fetchPersonalizedChunk } from '@/lib/personalize';
import type { Question } from '@/types/questions';

/**
 * Returns personalized questions for a chunk.
 * Fallback chain: AI personalized → static contextVariants → base questions.
 */
export function usePersonalizedQuestions(chunk: number): {
  questions: Question[];
  isLoading: boolean;
} {
  const context = useContextStore((s) => s.context);
  const isReady = useAIQuestionsStore((s) => s.isChunkReady(chunk));
  const isLoading = useAIQuestionsStore((s) => s.isChunkLoading(chunk));
  const personalizedChunks = useAIQuestionsStore((s) => s.personalizedChunks);
  const failedChunks = useAIQuestionsStore((s) => s.failedChunks);
  const hasFailed = failedChunks.has(chunk);
  const fetchingRef = useRef<Set<number>>(new Set());

  // Trigger fetch if not ready, not loading, not failed
  useEffect(() => {
    if (!context || isReady || isLoading || hasFailed) return;
    if (fetchingRef.current.has(chunk)) return;

    fetchingRef.current.add(chunk);
    const store = useAIQuestionsStore.getState();
    store.setChunkLoading(chunk, true);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    fetchPersonalizedChunk(chunk, context, controller.signal)
      .then((questions) => {
        useAIQuestionsStore.getState().setChunkQuestions(chunk, questions);
      })
      .catch(() => {
        useAIQuestionsStore.getState().setChunkFailed(chunk);
      })
      .finally(() => {
        clearTimeout(timeout);
        fetchingRef.current.delete(chunk);
      });

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [chunk, context, isReady, isLoading, hasFailed]);

  const questions = useMemo(() => {
    const base = getQuestionsByChunk(chunk);

    // Best: AI personalized
    if (isReady && personalizedChunks[chunk]) {
      return mergePersonalized(base, personalizedChunks[chunk]);
    }

    // Fallback: static contextVariants
    if (!context) return base;
    return base.map((q) => adaptQuestion(q, context));
  }, [chunk, isReady, personalizedChunks, context]);

  return { questions, isLoading };
}

/**
 * Pre-fetch a chunk's personalized questions.
 * Call imperatively (not a hook) — e.g., from context page or test page effect.
 */
export function prefetchChunk(chunk: number): void {
  const store = useAIQuestionsStore.getState();
  const context = useContextStore.getState().context;

  if (!context || store.isChunkReady(chunk) || store.loadingChunks.has(chunk) || store.failedChunks.has(chunk)) {
    return;
  }

  store.setChunkLoading(chunk, true);

  const controller = new AbortController();
  setTimeout(() => controller.abort(), 8000);

  fetchPersonalizedChunk(chunk, context, controller.signal)
    .then((questions) => {
      useAIQuestionsStore.getState().setChunkQuestions(chunk, questions);
    })
    .catch(() => {
      useAIQuestionsStore.getState().setChunkFailed(chunk);
    });
}
