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

  // Select raw state — arrays/objects that Zustand can diff by reference
  const personalizedChunks = useAIQuestionsStore((s) => s.personalizedChunks);
  const loadingChunks = useAIQuestionsStore((s) => s.loadingChunks);
  const failedChunks = useAIQuestionsStore((s) => s.failedChunks);

  // Derive booleans from raw state (in render, not in selector)
  const isReady = chunk in personalizedChunks;
  const isLoading = loadingChunks.includes(chunk);
  const hasFailed = failedChunks.includes(chunk);

  const fetchingRef = useRef<Set<number>>(new Set());

  // Trigger fetch if not ready, not loading, not failed
  useEffect(() => {
    if (!context || isReady || isLoading || hasFailed) return;
    if (fetchingRef.current.has(chunk)) return;

    console.log(`[AI Questions] Hook triggering fetch for chunk ${chunk}`);
    fetchingRef.current.add(chunk);
    useAIQuestionsStore.getState().setChunkLoading(chunk, true);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    let aborted = false;

    fetchPersonalizedChunk(chunk, context, controller.signal)
      .then((questions) => {
        if (aborted) return;
        console.log(`[AI Questions] Hook: chunk ${chunk} fetched successfully (${questions.length} questions)`);
        useAIQuestionsStore.getState().setChunkQuestions(chunk, questions);
      })
      .catch((err) => {
        if (aborted) return; // StrictMode cleanup — not a real failure
        console.error(`[AI Questions] Hook: chunk ${chunk} fetch failed:`, err);
        useAIQuestionsStore.getState().setChunkFailed(chunk);
      })
      .finally(() => {
        clearTimeout(timeout);
        fetchingRef.current.delete(chunk);
      });

    return () => {
      aborted = true;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [chunk, context, isReady, isLoading, hasFailed]);

  const questions = useMemo(() => {
    const base = getQuestionsByChunk(chunk);

    // Best: AI personalized
    if (isReady && personalizedChunks[chunk]) {
      console.log(`[AI Questions] Chunk ${chunk}: using AI-personalized questions`);
      return mergePersonalized(base, personalizedChunks[chunk]);
    }

    // Fallback: static contextVariants
    if (!context) {
      console.log(`[AI Questions] Chunk ${chunk}: no context, using base questions`);
      return base;
    }

    console.log(`[AI Questions] Chunk ${chunk}: using static contextVariants fallback (ready=${isReady}, loading=${isLoading}, failed=${hasFailed})`);
    return base.map((q) => adaptQuestion(q, context));
  }, [chunk, isReady, personalizedChunks, context, isLoading, hasFailed]);

  return { questions, isLoading };
}

/**
 * Pre-fetch a chunk's personalized questions.
 * Call imperatively (not a hook) — e.g., from context page or test page effect.
 */
export function prefetchChunk(chunk: number): void {
  const store = useAIQuestionsStore.getState();
  const context = useContextStore.getState().context;

  if (!context) {
    console.log(`[AI Questions] Prefetch chunk ${chunk}: no context, skipping`);
    return;
  }
  if (chunk in store.personalizedChunks) {
    console.log(`[AI Questions] Prefetch chunk ${chunk}: already ready, skipping`);
    return;
  }
  if (store.loadingChunks.includes(chunk)) {
    console.log(`[AI Questions] Prefetch chunk ${chunk}: already loading, skipping`);
    return;
  }
  if (store.failedChunks.includes(chunk)) {
    console.log(`[AI Questions] Prefetch chunk ${chunk}: previously failed, skipping`);
    return;
  }

  console.log(`[AI Questions] Prefetching chunk ${chunk}...`);
  store.setChunkLoading(chunk, true);

  const controller = new AbortController();
  setTimeout(() => controller.abort(), 30000);

  fetchPersonalizedChunk(chunk, context, controller.signal)
    .then((questions) => {
      console.log(`[AI Questions] Prefetch chunk ${chunk}: success (${questions.length} questions)`);
      useAIQuestionsStore.getState().setChunkQuestions(chunk, questions);
    })
    .catch((err) => {
      console.error(`[AI Questions] Prefetch chunk ${chunk}: failed:`, err);
      useAIQuestionsStore.getState().setChunkFailed(chunk);
    });
}
