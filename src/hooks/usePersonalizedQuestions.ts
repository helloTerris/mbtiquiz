'use client';

import { useMemo, useEffect } from 'react';
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
  const extraOptions = useAIQuestionsStore((s) => s.extraOptions);

  // Derive booleans from raw state (in render, not in selector)
  const isReady = chunk in personalizedChunks;
  const isLoading = loadingChunks.includes(chunk);
  const hasFailed = failedChunks.includes(chunk);

  // Trigger fetch if not ready, not loading, not failed
  // Dedup via isLoading from the store (no ref needed)
  useEffect(() => {
    if (!context || isReady || isLoading || hasFailed) return;

    console.log(`[AI Questions] Hook triggering fetch for chunk ${chunk}`);
    useAIQuestionsStore.getState().setChunkLoading(chunk, true);

    const controller = new AbortController();

    fetchPersonalizedChunk(chunk, context, AbortSignal.any([
      controller.signal,
      AbortSignal.timeout(30_000),
    ]))
      .then((questions) => {
        if (controller.signal.aborted) return; // Cleanup abort — ignore
        console.log(`[AI Questions] Hook: chunk ${chunk} fetched successfully (${questions.length} questions)`);
        useAIQuestionsStore.getState().setChunkQuestions(chunk, questions);
      })
      .catch((err) => {
        if (controller.signal.aborted) return; // Cleanup abort — loading state reset below
        if (err instanceof DOMException && err.name === 'TimeoutError') {
          console.warn(`[AI Questions] Hook: chunk ${chunk} timed out`);
        } else {
          console.error(`[AI Questions] Hook: chunk ${chunk} fetch failed:`, err);
        }
        useAIQuestionsStore.getState().setChunkFailed(chunk);
      });

    return () => {
      controller.abort();
      // Reset loading state so re-mount (StrictMode) or next effect can retry
      useAIQuestionsStore.getState().setChunkLoading(chunk, false);
    };
  }, [chunk, context, isReady, isLoading, hasFailed]);

  const questions = useMemo(() => {
    const base = getQuestionsByChunk(chunk);

    let merged: Question[];

    // Best: AI personalized
    if (isReady && personalizedChunks[chunk]) {
      merged = mergePersonalized(base, personalizedChunks[chunk]);
    } else if (!context) {
      merged = base;
    } else {
      merged = base.map((q) => adaptQuestion(q, context));
    }

    // Append extra options from "More options" clicks
    return merged.map((q) => {
      const extras = extraOptions[q.id];
      if (!extras || extras.length === 0) return q;
      return { ...q, options: [...q.options, ...extras] };
    });
  }, [chunk, isReady, personalizedChunks, context, isLoading, hasFailed, extraOptions]);

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

  fetchPersonalizedChunk(chunk, context, AbortSignal.timeout(30_000))
    .then((questions) => {
      console.log(`[AI Questions] Prefetch chunk ${chunk}: success (${questions.length} questions)`);
      useAIQuestionsStore.getState().setChunkQuestions(chunk, questions);
    })
    .catch((err) => {
      if (err instanceof DOMException && (err.name === 'TimeoutError' || err.name === 'AbortError')) {
        console.warn(`[AI Questions] Prefetch chunk ${chunk}: timed out`);
      } else {
        console.error(`[AI Questions] Prefetch chunk ${chunk}: failed:`, err);
      }
      useAIQuestionsStore.getState().setChunkFailed(chunk);
    });
}
