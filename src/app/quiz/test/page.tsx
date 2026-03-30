'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { ForcedChoice } from '@/components/quiz/ForcedChoice';
import { MidQuizCheckIn } from '@/components/quiz/MidQuizCheckIn';
import { LiveFunctionBars } from '@/components/live/LiveFunctionBars';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useQuizStore } from '@/stores/quiz-store';
import { useContextStore } from '@/stores/context-store';
import { useAIQuestionsStore } from '@/stores/ai-questions-store';
import { useHydration } from '@/hooks/useHydration';
import { CORE_QUESTIONS } from '@/engine/questions/question-bank';
import { usePersonalizedQuestions } from '@/hooks/usePersonalizedQuestions';
import { shouldTriggerAdaptive } from '@/engine/questions/question-selector';
import { fetchRefreshedQuestion, buildExtraOptions } from '@/lib/personalize';
import { getQuestionsByChunk } from '@/engine/questions/question-bank';
import type { Answer } from '@/types/questions';
import type { PreviousVersion } from '@/types/ai-questions';
import { QUESTIONS_PER_CHUNK, TOTAL_CHUNKS, getAmbiguityThreshold } from '@/lib/constants';

const CHECK_IN_AFTER_CHUNK = 2; // Show check-in after completing chunk 2 (halfway)

export default function TestPage() {
  const router = useRouter();
  const hydrated = useHydration();
  const [showCheckIn, setShowCheckIn] = useState(false);

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
  const refreshingIds = useAIQuestionsStore((s) => s.refreshingQuestionIds);
  const storeExtraOptions = useAIQuestionsStore((s) => s.extraOptions);

  // Get current chunk's questions (AI personalized → static variant → base)
  // All 4 chunks are fetched in parallel from the context page
  const { questions: chunkQuestions } = usePersonalizedQuestions(currentChunk);

  const currentQuestion = chunkQuestions[currentQuestionIndex];
  const isRefreshing = currentQuestion ? refreshingIds.includes(currentQuestion.id) : false;
  const extraCount = currentQuestion ? (storeExtraOptions[currentQuestion.id]?.length ?? 0) : 0;
  const canGenerateMore = extraCount < 4; // cap at 3 generations (6 total options)

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
        } else if (currentChunk === CHECK_IN_AFTER_CHUNK) {
          // Show mid-quiz check-in after chunk 2
          setShowCheckIn(true);
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
      context?.lifeStage,
    ]
  );

  const handleRefresh = useCallback(() => {
    if (!currentQuestion || !context || isRefreshing) return;

    const questionId = currentQuestion.id;
    const store = useAIQuestionsStore.getState();

    // Cap at 3 generations (6 total options)
    const existingExtras = store.extraOptions[questionId]?.length ?? 0;
    if (existingExtras >= 4) return;

    store.setQuestionRefreshing(questionId, true);

    // Collect all previously shown option texts so the AI avoids repeating them
    const previousVersions: PreviousVersion[] = [];
    const currentPersonalized = store.personalizedChunks[currentChunk]?.find((q) => q.id === questionId);
    if (currentPersonalized) {
      previousVersions.push({
        text: currentPersonalized.text,
        options: [{ text: currentPersonalized.options[0].text }, { text: currentPersonalized.options[1].text }],
      });
    }
    // Add extra option pairs as previous versions
    const extras = store.extraOptions[questionId] ?? [];
    for (let i = 0; i < extras.length; i += 2) {
      previousVersions.push({
        text: currentPersonalized?.text ?? '',
        options: [{ text: extras[i].text }, { text: extras[i + 1].text }],
      });
    }

    const baseQuestion = getQuestionsByChunk(currentChunk).find((q) => q.id === questionId)!;
    const genIndex = existingExtras / 2 + 1;

    fetchRefreshedQuestion(questionId, currentChunk, context, previousVersions, AbortSignal.timeout(30_000))
      .then((refreshed) => {
        const newOptions = buildExtraOptions(baseQuestion, refreshed, genIndex);
        useAIQuestionsStore.getState().appendExtraOptions(questionId, newOptions);
      })
      .catch((err) => {
        if (err instanceof DOMException && (err.name === 'TimeoutError' || err.name === 'AbortError')) {
          console.warn(`[AI Questions] More options ${questionId}: timed out`);
        } else {
          console.error(`[AI Questions] More options ${questionId}: failed:`, err);
        }
      })
      .finally(() => {
        useAIQuestionsStore.getState().setQuestionRefreshing(questionId, false);
      });
  }, [currentQuestion, currentChunk, context, isRefreshing]);

  const handleCheckInContinue = useCallback(() => {
    setShowCheckIn(false);
    nextChunk();
  }, [nextChunk]);

  if (!hydrated) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <div className="text-muted">Loading...</div>
      </main>
    );
  }

  // Mid-quiz check-in screen
  if (showCheckIn && normalizedScores) {
    return (
      <MidQuizCheckIn
        normalizedScores={normalizedScores}
        totalAnswered={totalAnswered}
        totalQuestions={totalQuestions}
        onContinue={handleCheckInContinue}
      />
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
              onRefresh={context && canGenerateMore ? handleRefresh : undefined}
              isRefreshing={isRefreshing}
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
