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

    console.log('[AI Questions] Context page: starting chunk 1 generation', {
      lifeStage: context.lifeStage,
      lifeStageDetail: context.lifeStageDetail,
      workEnvironment: context.workEnvironment,
      workEnvironmentDetail: context.workEnvironmentDetail,
    });

    // Generate chunk 1 with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
      const questions = await fetchPersonalizedChunk(1, context, controller.signal);
      console.log(`[AI Questions] Context page: chunk 1 success — ${questions.length} questions personalized`);
      console.log('[AI Questions] Sample rewritten question:', questions[0]?.text);
      useAIQuestionsStore.getState().setChunkQuestions(1, questions);
    } catch (err) {
      console.error('[AI Questions] Context page: chunk 1 failed, falling back to static variants:', err);
      useAIQuestionsStore.getState().setChunkFailed(1);
    } finally {
      clearTimeout(timeout);
    }

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
