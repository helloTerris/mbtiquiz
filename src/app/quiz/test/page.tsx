'use client';

import { useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { ForcedChoice } from '@/components/quiz/ForcedChoice';
import { LiveFunctionBars } from '@/components/live/LiveFunctionBars';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useQuizStore } from '@/stores/quiz-store';
import { useContextStore } from '@/stores/context-store';
import { useHydration } from '@/hooks/useHydration';
import { CORE_QUESTIONS, getQuestionsByChunk } from '@/engine/questions/question-bank';
import { adaptQuestion } from '@/engine/questions/context-adapter';
import { shouldTriggerAdaptive } from '@/engine/questions/question-selector';
import type { Answer } from '@/types/questions';
import { QUESTIONS_PER_CHUNK, TOTAL_CHUNKS, getAmbiguityThreshold } from '@/lib/constants';

export default function TestPage() {
  const router = useRouter();
  const hydrated = useHydration();

  const {
    currentChunk,
    currentQuestionIndex,
    answers,
    normalizedScores,
    submitAnswer,
    nextQuestion,
    nextChunk,
    setPhase,
    setAdaptiveNeeded,
    goBack,
  } = useQuizStore();

  const context = useContextStore((s) => s.context);

  // Get current chunk's questions
  const chunkQuestions = useMemo(() => {
    const questions = getQuestionsByChunk(currentChunk);
    if (!context) return questions;
    return questions.map((q) => adaptQuestion(q, context));
  }, [currentChunk, context]);

  const currentQuestion = chunkQuestions[currentQuestionIndex];

  // Overall progress
  const totalAnswered = answers.length;
  const totalQuestions = CORE_QUESTIONS.length;
  const progressPercent = (totalAnswered / totalQuestions) * 100;

  const handleAnswer = useCallback(
    (answer: Answer) => {
      if (!currentQuestion) return;

      submitAnswer(answer, currentQuestion);

      // Check if chunk is done
      if (currentQuestionIndex >= chunkQuestions.length - 1) {
        // Check if all chunks are done
        if (currentChunk >= TOTAL_CHUNKS) {
          // Check if adaptive questions needed
          if (normalizedScores && shouldTriggerAdaptive(normalizedScores, getAmbiguityThreshold(context?.lifeStage))) {
            setAdaptiveNeeded(true);
            setPhase('refine');
            router.push('/quiz/refine');
          } else {
            setPhase('results');
            router.push('/quiz/results');
          }
        } else {
          nextChunk();
        }
      } else {
        nextQuestion();
      }
    },
    [
      currentQuestion,
      currentQuestionIndex,
      chunkQuestions.length,
      currentChunk,
      normalizedScores,
      submitAnswer,
      nextQuestion,
      nextChunk,
      setPhase,
      setAdaptiveNeeded,
      router,
    ]
  );

  if (!hydrated) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <div className="text-muted">Loading...</div>
      </main>
    );
  }

  if (!currentQuestion) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <div className="text-muted">No questions available</div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col px-4 py-8">
      {/* Top progress bar */}
      <div className="w-full max-w-2xl mx-auto mb-2">
        <ProgressBar value={progressPercent} />
        <div className="flex justify-between mt-1">
          <span className="text-sm text-muted font-mono">
            Chunk {currentChunk} / {TOTAL_CHUNKS}
          </span>
          <span className="text-sm text-muted font-mono">
            {totalAnswered} / {totalQuestions}
          </span>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full flex gap-8 items-start justify-center">
          {/* Question card */}
          <div className="flex-1 max-w-2xl">
            <ForcedChoice
              question={currentQuestion}
              questionNumber={totalAnswered + 1}
              totalQuestions={totalQuestions}
              onAnswer={handleAnswer}
              onBack={totalAnswered > 0 ? goBack : undefined}
            />
          </div>

          {/* Live function bars (desktop sidebar) */}
          {normalizedScores && totalAnswered > 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden lg:block w-56 sticky top-8"
            >
              <LiveFunctionBars
                normalizedScores={normalizedScores}
                className="glass rounded-xl p-4"
              />
            </motion.div>
          )}
        </div>
      </div>

      {/* Mobile live bars (bottom sheet) */}
      {normalizedScores && totalAnswered > 3 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:hidden mt-6"
        >
          <LiveFunctionBars
            normalizedScores={normalizedScores}
            className="glass rounded-xl p-4 max-w-2xl mx-auto"
          />
        </motion.div>
      )}
    </main>
  );
}
