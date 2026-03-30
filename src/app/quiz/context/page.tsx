'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { ContextForm } from '@/components/quiz/ContextForm';
import { PersonalizingOverlay } from '@/components/quiz/PersonalizingOverlay';
import { useContextStore } from '@/stores/context-store';
import { useQuizStore } from '@/stores/quiz-store';
import { useAIQuestionsStore } from '@/stores/ai-questions-store';
import { fetchPersonalizedChunk } from '@/lib/personalize';
import type { UserContext } from '@/types/context';

export default function ContextPage() {
  const router = useRouter();
  const setContext = useContextStore((s) => s.setContext);
  const setPhase = useQuizStore((s) => s.setPhase);
  const [isPersonalizing, setIsPersonalizing] = useState(false);

  const handleSubmit = async (context: UserContext) => {
    setContext(context);
    setIsPersonalizing(true);

    // Reset AI store for fresh generation
    useAIQuestionsStore.getState().reset();

    console.log('[AI Questions] Context page: starting all 4 chunks in parallel', {
      lifeStage: context.lifeStage,
      lifeStageDetail: context.lifeStageDetail,
      workEnvironment: context.workEnvironment,
      workEnvironmentDetail: context.workEnvironmentDetail,
    });

    // Fire all 4 chunks in parallel — wait only for chunk 1 before navigating
    const store = useAIQuestionsStore.getState();
    for (let c = 1; c <= 4; c++) store.setChunkLoading(c, true);

    const fetchChunk = async (chunk: number) => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);
      try {
        const questions = await fetchPersonalizedChunk(chunk, context, controller.signal);
        console.log(`[AI Questions] Chunk ${chunk}: success (${questions.length} questions)`);
        useAIQuestionsStore.getState().setChunkQuestions(chunk, questions);
      } catch (err) {
        console.error(`[AI Questions] Chunk ${chunk}: failed:`, err);
        useAIQuestionsStore.getState().setChunkFailed(chunk);
      } finally {
        clearTimeout(timeout);
      }
    };

    // Chunks 2-4 fire and resolve in the background
    fetchChunk(2);
    fetchChunk(3);
    fetchChunk(4);

    // Wait only for chunk 1 — user needs it to start the quiz
    await fetchChunk(1);

    // Log store state before navigating
    const storeState = useAIQuestionsStore.getState();
    console.log('[AI Questions] Store state before navigation:', {
      chunksReady: Object.keys(storeState.personalizedChunks),
      loading: storeState.loadingChunks,
      failed: storeState.failedChunks,
    });

    setPhase('test');
    router.push('/quiz/test');
  };

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-16">
      <AnimatePresence>
        {isPersonalizing && <PersonalizingOverlay />}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full"
      >
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Before we begin
          </h1>
          <p className="text-muted text-sm max-w-md mx-auto">
            A few quick questions about your current situation.
            This helps us adapt the test to your context — it does not affect your type.
          </p>
        </div>

        <ContextForm onSubmit={handleSubmit} />
      </motion.div>
    </main>
  );
}
