'use client';

import { useMemo, useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { ForcedChoice } from '@/components/quiz/ForcedChoice';
import { useQuizStore } from '@/stores/quiz-store';
import { useResultsStore } from '@/stores/results-store';
import { useHydration } from '@/hooks/useHydration';
import { selectAdaptiveQuestions } from '@/engine/questions/adaptive-questions';
import { useContextStore } from '@/stores/context-store';
import { getAmbiguityThreshold } from '@/lib/constants';
import type { Answer } from '@/types/questions';

export default function RefinePage() {
  const router = useRouter();
  const hydrated = useHydration();
  const [currentIndex, setCurrentIndex] = useState(0);

  const { answers, normalizedScores, submitAnswer, setPhase, goBack } = useQuizStore();
  const clearResults = useResultsStore((s) => s.clear);
  const context = useContextStore((s) => s.context);

  // Clear stored results so they get regenerated after refinement
  useEffect(() => {
    clearResults();
  }, [clearResults]);

  const adaptiveQuestions = useMemo(() => {
    if (!normalizedScores) return [];
    const answeredIds = new Set(answers.map((a) => a.questionId));
    const threshold = getAmbiguityThreshold(context?.lifeStage);
    return selectAdaptiveQuestions(normalizedScores, answeredIds, 5, threshold);
  }, [normalizedScores, answers, context?.lifeStage]);

  const currentQuestion = adaptiveQuestions[currentIndex];

  const handleAnswer = useCallback(
    (answer: Answer) => {
      if (!currentQuestion) return;
      submitAnswer(answer, currentQuestion);

      if (currentIndex >= adaptiveQuestions.length - 1) {
        setPhase('results');
        router.push('/quiz/results');
      } else {
        setCurrentIndex((i) => i + 1);
      }
    },
    [currentQuestion, currentIndex, adaptiveQuestions.length, submitAnswer, setPhase, router]
  );

  // Redirect if no adaptive questions needed
  useEffect(() => {
    if (hydrated && adaptiveQuestions.length === 0) {
      setPhase('results');
      router.push('/quiz/results');
    }
  }, [hydrated, adaptiveQuestions.length, setPhase, router]);

  if (!hydrated || adaptiveQuestions.length === 0) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <div className="text-muted">Checking for refinement questions...</div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-2xl text-center mb-8"
      >
        <h2 className="text-lg font-medium text-foreground mb-1">
          Refining your results
        </h2>
        <p className="text-sm text-muted">
          Some of your function preferences are close. A few more questions will help pin them down.
        </p>
      </motion.div>

      {currentQuestion && (
        <ForcedChoice
          question={currentQuestion}
          questionNumber={currentIndex + 1}
          totalQuestions={adaptiveQuestions.length}
          onAnswer={handleAnswer}
          onBack={currentIndex > 0 ? () => {
            goBack();
            setCurrentIndex((i) => i - 1);
          } : undefined}
        />
      )}
    </main>
  );
}
