'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { TypeCard } from '@/components/results/TypeCard';
import { FunctionBars } from '@/components/results/FunctionBars';
import { ConfidenceMeter } from '@/components/results/ConfidenceMeter';
import { AlternativeTypes } from '@/components/results/AlternativeTypes';
import { StressProfile } from '@/components/results/StressProfile';
import { ExplanationPanel } from '@/components/results/ExplanationPanel';
import { TrueSelfComparison } from '@/components/results/TrueSelfComparison';
import { BiasIndicators } from '@/components/results/BiasIndicators';
import { LoopStateCard } from '@/components/results/LoopStateCard';
import { StackBreakdown } from '@/components/results/StackBreakdown';
import { Button } from '@/components/ui/Button';
import { useQuizStore } from '@/stores/quiz-store';
import { useContextStore } from '@/stores/context-store';
import { useResultsStore } from '@/stores/results-store';
import { useHydration } from '@/hooks/useHydration';
import { generateResult } from '@/engine/results/result-generator';
import { CORE_QUESTIONS } from '@/engine/questions/question-bank';
import { selectAdaptiveQuestions } from '@/engine/questions/adaptive-questions';
import { getAmbiguityThreshold } from '@/lib/constants';
import type { CognitiveFunction } from '@/types/cognitive-functions';

export default function ResultsPage() {
  const router = useRouter();
  const hydrated = useHydration();
  const { answers, normalizedScores, reset: resetQuiz } = useQuizStore();
  const context = useContextStore((s) => s.context);
  const { result: storedResult, setResult } = useResultsStore();

  const hasAdaptiveQuestions = useMemo(() => {
    if (!normalizedScores) return false;
    const answeredIds = new Set(answers.map((a) => a.questionId));
    const threshold = getAmbiguityThreshold(context?.lifeStage);
    return selectAdaptiveQuestions(normalizedScores, answeredIds, 5, threshold).length > 0;
  }, [normalizedScores, answers, context?.lifeStage]);

  const result = useMemo(() => {
    if (storedResult) return storedResult;
    if (answers.length === 0) return null;
    return generateResult(answers, CORE_QUESTIONS, context);
  }, [answers, context, storedResult]);

  // Persist generated result to store (outside render to avoid setState-during-render)
  useEffect(() => {
    if (result && !storedResult) {
      setResult(result);
    }
  }, [result, storedResult, setResult]);

  const handleRetake = () => {
    resetQuiz();
    useResultsStore.getState().clear();
    useContextStore.getState().clear();
    router.push('/');
  };

  if (!hydrated) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <div className="text-muted">Loading results...</div>
      </main>
    );
  }

  if (!result) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center gap-4">
        <p className="text-muted">No results available. Take the test first.</p>
        <Button variant="primary" onClick={() => router.push('/')}>
          Go Home
        </Button>
      </main>
    );
  }

  return (
    <main className="flex-1 px-4 py-8 md:py-12">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-4"
        >
          <p className="text-sm font-mono text-muted">Here&apos;s what we found</p>
        </motion.div>

        {/* Primary type card */}
        <TypeCard match={result.primaryType} confidence={result.confidence.overall} />

        {/* Two-column grid for details */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Function bars */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-2xl p-6"
          >
            <FunctionBars
              scores={result.functionScores as Record<CognitiveFunction, number>}
              rankings={result.primaryType.stack
                ? [
                    result.primaryType.stack.dominant,
                    result.primaryType.stack.auxiliary,
                    result.primaryType.stack.tertiary,
                    result.primaryType.stack.inferior,
                    ...Object.keys(result.functionScores).filter(
                      (fn) =>
                        fn !== result.primaryType.stack.dominant &&
                        fn !== result.primaryType.stack.auxiliary &&
                        fn !== result.primaryType.stack.tertiary &&
                        fn !== result.primaryType.stack.inferior
                    ),
                  ] as CognitiveFunction[]
                : (Object.keys(result.functionScores) as CognitiveFunction[])
              }
            />
          </motion.div>

          {/* Confidence meter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <ConfidenceMeter confidence={result.confidence} />
          </motion.div>
        </div>

        {/* Explanation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <ExplanationPanel
            explanation={result.explanations}
            rankings={
              result.primaryType.stack
                ? [
                    result.primaryType.stack.dominant,
                    result.primaryType.stack.auxiliary,
                    result.primaryType.stack.tertiary,
                    result.primaryType.stack.inferior,
                  ]
                : []
            }
          />
        </motion.div>

        {/* Stack breakdown — all 4 positions explained */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
        >
          <StackBreakdown stack={result.primaryType.stack} />
        </motion.div>

        {/* Alternative types */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
        >
          <AlternativeTypes alternatives={result.alternativeTypes} />
        </motion.div>

        {/* Stress profile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <StressProfile profile={result.stressProfile} />
        </motion.div>

        {/* Loop state warning */}
        {result.loopState?.detected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.72 }}
          >
            <LoopStateCard loopState={result.loopState} />
          </motion.div>
        )}

        {/* True self comparison */}
        {result.trueSelfAnalysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75 }}
          >
            <TrueSelfComparison analysis={result.trueSelfAnalysis} />
          </motion.div>
        )}

        {/* Bias indicators */}
        {result.biasIndicators.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <BiasIndicators indicators={result.biasIndicators} />
          </motion.div>
        )}

        {/* Contradictions warning */}
        {result.contradictions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85 }}
            className="glass rounded-2xl p-6 border border-amber-500/20"
          >
            <h3 className="text-sm font-mono text-amber-400 uppercase tracking-wider mb-3">
              Some answers didn&apos;t match up
            </h3>
            <div className="space-y-2">
              {result.contradictions.map((c, i) => (
                <p key={i} className="text-sm text-muted">
                  {c.description}
                </p>
              ))}
            </div>
            <p className="text-sm text-muted mt-3">
              You gave different answers to similar questions. This is normal — it might mean you were answering based on who you want to be, not who you naturally are.
            </p>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.95 }}
          className="flex flex-col items-center gap-3 pt-4 pb-8"
        >
          <div className="flex flex-row gap-3">
            {hasAdaptiveQuestions && (
              <Button
                variant="primary"
                onClick={() => router.push('/quiz/refine')}
              >
                Improve My Results
              </Button>
            )}
            <Button variant="secondary" onClick={handleRetake}>
              Retake Test
            </Button>
          </div>
          {!hasAdaptiveQuestions && (
            <p className="text-xs text-muted">Your scores are already clear — no close calls to refine.</p>
          )}
        </motion.div>
      </div>
    </main>
  );
}
